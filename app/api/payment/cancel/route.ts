import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { order, ticket } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export const dynamic = "force-dynamic"

/**
 * Cancel URL Endpoint (User redirect when cancelling checkout on OPay Cashier)
 * Idempotently marks the pending order as cancelled and redirects to the client status page.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const orderId = searchParams.get("orderId")
  const reference = searchParams.get("reference")

  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin

  if (!orderId && !reference) {
    return NextResponse.redirect(new URL("/payment/status?status=cancelled", baseUrl))
  }

  const conditions = []
  if (orderId) conditions.push(eq(order.id, orderId))
  if (reference) conditions.push(eq(order.paymentReference, reference))

  const existingOrders = await db
    .select()
    .from(order)
    .where(conditions.length > 1 ? or(...conditions) : conditions[0])
    .limit(1)

  const existingOrder = existingOrders[0]

  if (existingOrder) {
    // If order was pending, mark as cancelled
    if (existingOrder.status === "pending") {
      await db
        .update(order)
        .set({
          status: "cancelled",
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
    }

    return NextResponse.redirect(
      new URL(`/payment/status?orderId=${existingOrder.id}&status=cancelled`, baseUrl)
    )
  }

  return NextResponse.redirect(
    new URL(`/payment/status?status=cancelled&reference=${reference || ""}`, baseUrl)
  )
}
