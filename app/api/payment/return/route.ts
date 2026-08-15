import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { order } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export const dynamic = "force-dynamic"

/**
 * Return URL Endpoint (User redirect after completing payment on OPay Cashier)
 * Checks the order in the backend and redirects the user to the client status page.
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
    return NextResponse.redirect(new URL("/payment/status?status=unknown", baseUrl))
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

  if (!existingOrder) {
    return NextResponse.redirect(
      new URL(`/payment/status?status=not_found&reference=${reference || ""}`, baseUrl)
    )
  }

  // Redirect client to status page with verified order details
  return NextResponse.redirect(
    new URL(`/payment/status?orderId=${existingOrder.id}`, baseUrl)
  )
}
