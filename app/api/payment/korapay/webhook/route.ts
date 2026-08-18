import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { order, ticket } from "@/db/schema"
import { eq, or } from "drizzle-orm"
import {
  korapayPaymentService,
  KorapayWebhookEvent,
} from "@/lib/payment-korapay"

export const dynamic = "force-dynamic"

/**
 * Webhook Callback Endpoint (Korapay Notification)
 * Accepts unauthenticated POST requests from Korapay.
 * Must respond with HTTP 200 OK to acknowledge receipt.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    if (!rawBody) {
      return NextResponse.json({ message: "Empty body" }, { status: 200 })
    }

    let eventData: KorapayWebhookEvent
    try {
      eventData = JSON.parse(rawBody)
    } catch {
      console.error("[Korapay Webhook] Failed to parse JSON body:", rawBody)
      return NextResponse.json({ message: "Invalid JSON" }, { status: 200 })
    }

    const { event, data } = eventData

    if (!data || !data.reference) {
      console.warn("[Korapay Webhook] Missing data or reference:", eventData)
      return NextResponse.json({ message: "Missing payload data" }, { status: 200 })
    }

    // 1. Signature verification
    const signature = req.headers.get("x-korapay-signature") ?? ""
    const isValid = korapayPaymentService.verifyWebhookSignature(data, signature)
    if (!isValid) {
      console.error("[Korapay Webhook] Invalid webhook signature for reference:", data.reference)
      // Return 200 to prevent malicious replay amplification, but do not process
      return NextResponse.json({ message: "Invalid signature" }, { status: 200 })
    }

    const reference = data.reference

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
      console.warn(`[Korapay Webhook] Order not found for reference: ${reference}`)
      return NextResponse.json({ message: "Order not found acknowledged" }, { status: 200 })
    }

    // 3. Idempotent State Updates
    if (event === "charge.success" && data.status === "success") {
      if (existingOrder.status === "paid") {
        // Already processed, return 200 immediately
        return NextResponse.json({ message: "Order already marked as paid" }, { status: 200 })
      }

      await db
        .update(order)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(eq(order.id, existingOrder.id))

      await db
        .update(ticket)
        .set({
          status: "valid",
          updatedAt: new Date(),
        })
        .where(eq(ticket.orderId, existingOrder.id))

      console.log(`[Korapay Webhook] Order ${existingOrder.id} successfully marked as PAID`)
    } else if (event === "charge.failed") {
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

        console.log(`[Korapay Webhook] Order ${existingOrder.id} marked as FAILED`)
      }
    }

    return NextResponse.json({ message: "SUCCESS" }, { status: 200 })
  } catch (error) {
    console.error("[Korapay Webhook] Unexpected error:", error)
    // Always return 200 OK so Korapay does not bombard the endpoint on internal non-retriable exceptions
    return NextResponse.json({ message: "Internal error logged" }, { status: 200 })
  }
}
