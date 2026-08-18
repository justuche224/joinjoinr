import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { order, ticket } from "@/db/schema"
import { eq, or } from "drizzle-orm"
import {
  paymentService,
  OPayWebhookEvent,
} from "@/lib/payment"

export const dynamic = "force-dynamic"

/**
 * Webhook Callback Endpoint (OPay Notification)
 * Accepts unauthenticated POST requests from OPay.
 * Must respond with HTTP 200 OK to acknowledge receipt.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    if (!rawBody) {
      return NextResponse.json({ message: "Empty body" }, { status: 200 })
    }

    let eventData: OPayWebhookEvent
    try {
      eventData = JSON.parse(rawBody)
    } catch {
      console.error("[OPay Webhook] Failed to parse JSON body:", rawBody)
      return NextResponse.json({ message: "Invalid JSON" }, { status: 200 })
    }

    const { payload, sha512 } = eventData

    if (!payload || !payload.reference) {
      console.warn("[OPay Webhook] Missing payload or reference:", eventData)
      return NextResponse.json({ message: "Missing payload data" }, { status: 200 })
    }

    // 1. Signature Cross Verification
    if (sha512) {
      const isValid = paymentService.verifyWebhookSignature(payload, sha512)
      if (!isValid) {
        console.error("[OPay Webhook] Invalid webhook signature for reference:", payload.reference)
        // Return 200 to prevent malicious replay amplification, but do not process
        return NextResponse.json({ message: "Invalid signature" }, { status: 200 })
      }
    }

    const reference = payload.reference
    const paymentStatus = (payload.status || "").toUpperCase()

    // 2. Find matching order in DB
    const matchingOrders = await db
      .select()
      .from(order)
      .where(or(
        eq(order.paymentReference, reference),
        eq(order.id, reference)
      ))
      .limit(1)

    const existingOrder = matchingOrders[0]

    if (!existingOrder) {
      console.warn(`[OPay Webhook] Order not found for reference: ${reference}`)
      return NextResponse.json({ message: "Order not found acknowledged" }, { status: 200 })
    }

    // 3. Idempotent State Updates
    if (paymentStatus === "SUCCESS") {
      if (existingOrder.status === "paid") {
        // Already processed, return 200 immediately
        return NextResponse.json({ message: "Order already marked as paid" }, { status: 200 })
      }

      // Mark order as paid
      await db
        .update(order)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(eq(order.id, existingOrder.id))

      // Ensure tickets are marked as valid
      await db
        .update(ticket)
        .set({
          status: "valid",
          updatedAt: new Date(),
        })
        .where(eq(ticket.orderId, existingOrder.id))

      console.log(`[OPay Webhook] Order ${existingOrder.id} successfully marked as PAID`)
    } else if (paymentStatus === "FAIL" || paymentStatus === "CLOSE" || paymentStatus === "FAILED") {
      if (existingOrder.status === "pending") {
        await db
          .update(order)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(order.id, existingOrder.id))

        await db
          .update(ticket)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(ticket.orderId, existingOrder.id))

        console.log(`[OPay Webhook] Order ${existingOrder.id} marked as FAILED`)
      }
    }

    return NextResponse.json({ code: "00000", message: "SUCCESS" }, { status: 200 })
  } catch (error) {
    console.error("[OPay Webhook] Unexpected error:", error)
    // Always return 200 OK so OPay does not bombard the endpoint on internal non-retriable exceptions
    return NextResponse.json({ message: "Internal error logged" }, { status: 200 })
  }
}
