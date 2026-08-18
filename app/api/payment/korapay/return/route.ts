import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { order } from "@/db/schema"
import { eq, or } from "drizzle-orm"

export const dynamic = "force-dynamic"

/**
 * Redirect URL Endpoint (User redirect after checkout on Korapay).
 * Korapay sends the customer here whether the transaction succeeded, failed,
 * or the checkout was closed/abandoned - there is no separate cancel URL.
 * Checks the order in the backend and redirects the user to the client status page.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const reference = searchParams.get("reference")

  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin

  if (!reference) {
    return NextResponse.redirect(new URL("/payment/status?status=unknown", baseUrl))
  }

  const existingOrders = await db
    .select()
    .from(order)
    .where(or(eq(order.paymentReference, reference), eq(order.id, reference)))
    .limit(1)

  const existingOrder = existingOrders[0]

  if (!existingOrder) {
    return NextResponse.redirect(
      new URL(`/payment/status?status=not_found&reference=${reference}`, baseUrl)
    )
  }

  // Redirect client to status page with verified order details
  return NextResponse.redirect(
    new URL(`/payment/status?orderId=${existingOrder.id}`, baseUrl)
  )
}
