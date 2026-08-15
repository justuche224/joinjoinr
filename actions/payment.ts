"use server"

import { headers } from "next/headers"
import crypto from "crypto"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { order, ticket, ticketTier, eventSession, event } from "@/db/schema"
import { paymentService, OPayApiError } from "@/lib/payment"
import { inArray, eq } from "drizzle-orm"

/**
 * Utility to verify authenticated user session
 */
async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized: Please sign in to continue.")
  }

  return session.user
}

export interface CheckoutItem {
  tierId: string
  quantity: number
}

export interface CreateEventCheckoutInput {
  sessionId: string
  items: CheckoutItem[]
  returnUrl?: string
  cancelUrl?: string
  callbackUrl?: string
}

export interface CheckoutResult {
  success: boolean
  cashierUrl: string
  orderId: string
  reference: string
  orderNo: string
}

/**
 * Server action to initiate an authenticated event ticket checkout with OPay Cashier
 */
export async function createEventPaymentCheckout(
  input: CreateEventCheckoutInput
): Promise<CheckoutResult> {
  const currentUser = await requireAuth()

  const { sessionId, items, returnUrl, cancelUrl, callbackUrl } = input

  if (!sessionId || !items || items.length === 0) {
    throw new Error("Invalid request: sessionId and items are required.")
  }

  const validItems = items.filter((i) => i.quantity > 0)
  if (validItems.length === 0) {
    throw new Error("Invalid request: at least one item quantity must be greater than 0.")
  }

  const sessionRows = await db
    .select({
      session: eventSession,
      event: event,
    })
    .from(eventSession)
    .innerJoin(event, eq(eventSession.eventId, event.id))
    .where(eq(eventSession.id, sessionId))
    .limit(1)

  if (sessionRows.length === 0) {
    throw new Error("Event session not found.")
  }

  const { session: currentSession, event: currentEvent } = sessionRows[0]

  const tierIds = validItems.map((item) => item.tierId)
  const tiersInDb = await db
    .select()
    .from(ticketTier)
    .where(inArray(ticketTier.id, tierIds))

  const tierMap = new Map(tiersInDb.map((t) => [t.id, t]))

  let totalAmountKobo = 0
  for (const item of validItems) {
    const tier = tierMap.get(item.tierId)
    if (!tier || tier.sessionId !== sessionId) {
      throw new Error(`Invalid ticket tier selected: ${item.tierId}`)
    }
    totalAmountKobo += tier.price * item.quantity
  }

  if (totalAmountKobo <= 0) {
    throw new Error("Total amount must be greater than 0.")
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"

  const orderId = crypto.randomUUID()
  // Unique reference for OPay (must be unique per transaction)
  const paymentReference = `ORD_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`

  // 1. Create pending order in database
  await db.insert(order).values({
    id: orderId,
    userId: currentUser.id,
    totalAmount: totalAmountKobo,
    status: "pending",
    paymentReference,
  })

  // 2. Pre-create reserved tickets for this order
  const ticketsToInsert = []
  for (const item of validItems) {
    for (let i = 0; i < item.quantity; i++) {
      ticketsToInsert.push({
        id: crypto.randomUUID(),
        orderId,
        sessionId,
        tierId: item.tierId,
        userId: currentUser.id,
        code: `TCK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        status: "valid" as const,
      })
    }
  }

  if (ticketsToInsert.length > 0) {
    await db.insert(ticket).values(ticketsToInsert)
  }

  // 3. Initiate payment with OPay Cashier
  try {
    const paymentResponse = await paymentService.createPayment({
      reference: paymentReference,
      country: "NG",
      amount: {
        total: totalAmountKobo,
        currency: "NGN",
      },
      returnUrl:
        returnUrl ||
        `${baseUrl}/api/payment/return?orderId=${orderId}&reference=${paymentReference}`,
      cancelUrl:
        cancelUrl ||
        `${baseUrl}/api/payment/cancel?orderId=${orderId}&reference=${paymentReference}`,
      callbackUrl: callbackUrl || `${baseUrl}/api/payment/webhook`,
      displayName: "JoinJoinr",
      userInfo: {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
      },
      product: {
        name: currentEvent.title,
        description: `Tickets for ${currentEvent.title} (${currentSession.label})`,
      },
      customerVisitSource: "BROWSER",
    })

    return {
      success: true,
      cashierUrl: paymentResponse.data.cashierUrl,
      orderId,
      reference: paymentReference,
      orderNo: paymentResponse.data.orderNo,
    }
  } catch (error) {
    // If OPay call fails, mark order as failed
    await db
      .update(order)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(order.id, orderId))

    if (error instanceof OPayApiError) {
      throw new Error(`Payment gateway error: ${error.message} (Code: ${error.code})`)
    }
    throw error
  }
}

export interface GenericPaymentInput {
  amountKobo: number
  productName: string
  productDescription: string
  reference?: string
  returnUrl?: string
  cancelUrl?: string
  callbackUrl?: string
}

/**
 * General-purpose authenticated server action to create an OPay payment session
 */
export async function createGenericPayment(
  input: GenericPaymentInput
): Promise<CheckoutResult> {
  const currentUser = await requireAuth()

  const {
    amountKobo,
    productName,
    productDescription,
    reference,
    returnUrl,
    cancelUrl,
    callbackUrl,
  } = input

  if (amountKobo <= 0) {
    throw new Error("Amount must be greater than 0.")
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"

  const orderId = crypto.randomUUID()
  const paymentReference =
    reference || `PAY_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`

  await db.insert(order).values({
    id: orderId,
    userId: currentUser.id,
    totalAmount: amountKobo,
    status: "pending",
    paymentReference,
  })

  try {
    const paymentResponse = await paymentService.createPayment({
      reference: paymentReference,
      country: "NG",
      amount: {
        total: amountKobo,
        currency: "NGN",
      },
      returnUrl:
        returnUrl ||
        `${baseUrl}/api/payment/return?orderId=${orderId}&reference=${paymentReference}`,
      cancelUrl:
        cancelUrl ||
        `${baseUrl}/api/payment/cancel?orderId=${orderId}&reference=${paymentReference}`,
      callbackUrl: callbackUrl || `${baseUrl}/api/payment/webhook`,
      displayName: "JoinJoinr",
      userInfo: {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
      },
      product: {
        name: productName,
        description: productDescription,
      },
      customerVisitSource: "BROWSER",
    })

    return {
      success: true,
      cashierUrl: paymentResponse.data.cashierUrl,
      orderId,
      reference: paymentReference,
      orderNo: paymentResponse.data.orderNo,
    }
  } catch (error) {
    await db
      .update(order)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(order.id, orderId))

    if (error instanceof OPayApiError) {
      throw new Error(`Payment gateway error: ${error.message} (Code: ${error.code})`)
    }
    throw error
  }
}
