import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { order, ticket, eventSession, event, ticketTier } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Ticket,
  Calendar,
  ShieldCheck,
} from "lucide-react"
import { formatKoboToNaira } from "@/lib/utils"
import Nav from "@/components/shared/nav"
import Footer from "@/components/shared/footer"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    orderId?: string
    reference?: string
    status?: string
  }>
}

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const { orderId, reference, status: urlStatus } = await searchParams

  let orderData = null
  let ticketsList: Array<{
    id: string
    code: string
    status: string
    eventTitle?: string
    sessionLabel?: string
    tierName?: string
  }> = []

  if (orderId) {
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1)

    if (orders.length > 0) {
      orderData = orders[0]

      const ticketsData = await db
        .select({
          ticket: ticket,
          session: eventSession,
          tier: ticketTier,
          event: event,
        })
        .from(ticket)
        .leftJoin(eventSession, eq(ticket.sessionId, eventSession.id))
        .leftJoin(event, eq(eventSession.eventId, event.id))
        .leftJoin(ticketTier, eq(ticket.tierId, ticketTier.id))
        .where(eq(ticket.orderId, orderId))

      ticketsList = ticketsData.map((t) => ({
        id: t.ticket.id,
        code: t.ticket.code,
        status: t.ticket.status,
        eventTitle: t.event?.title,
        sessionLabel: t.session?.label,
        tierName: t.tier?.name,
      }))
    }
  }

  // Determine effective status
  const currentStatus =
    orderData?.status ||
    urlStatus ||
    "pending"

  const isSuccess = currentStatus === "paid"
  const isFailed = currentStatus === "failed"
  const isCancelled = currentStatus === "cancelled"
  const isPending = currentStatus === "pending"

  const firstTicket = ticketsList[0]

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Status Header Card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="p-8 text-center sm:p-10">
              {isSuccess && (
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="size-8" />
                </div>
              )}
              {isFailed && (
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
                  <XCircle className="size-8" />
                </div>
              )}
              {isCancelled && (
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
                  <XCircle className="size-8" />
                </div>
              )}
              {isPending && (
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 ring-8 ring-blue-500/5">
                  <Clock className="size-8" />
                </div>
              )}

              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isSuccess && "Payment Successful!"}
                {isFailed && "Payment Failed"}
                {isCancelled && "Payment Cancelled"}
                {isPending && "Payment Processing"}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isSuccess &&
                  "Your transaction was completed successfully. Your tickets have been issued and are available in your dashboard."}
                {isFailed &&
                  "Your payment could not be processed by OPay. Please check your payment details or try a different payment method."}
                {isCancelled &&
                  "You cancelled the payment transaction. No charges were made to your account."}
                {isPending &&
                  "We have received your payment request and are waiting for confirmation from OPay. This page will update shortly."}
              </p>

              {/* Order summary box */}
              {orderData && (
                <div className="mt-8 rounded-2xl border border-border bg-muted/20 p-5 text-left">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        Order Reference
                      </p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {orderData.paymentReference || orderData.id.slice(0, 12)}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        Total Amount
                      </p>
                      <p className="mt-1 font-mono text-base font-semibold text-brass-ink">
                        {formatKoboToNaira(orderData.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {firstTicket && firstTicket.eventTitle && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <Calendar className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{firstTicket.eventTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {firstTicket.sessionLabel} • {ticketsList.length} ticket(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {isSuccess && (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-90"
                    >
                      <Ticket className="size-4" />
                      View Tickets
                    </Link>
                    <Link
                      href="/events"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 font-medium text-foreground transition-colors hover:bg-muted/40"
                    >
                      Browse More Events
                    </Link>
                  </>
                )}

                {(isFailed || isCancelled) && (
                  <>
                    <Link
                      href="/events"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-90"
                    >
                      Browse Events
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 font-medium text-foreground transition-colors hover:bg-muted/40"
                    >
                      Go to Dashboard
                    </Link>
                  </>
                )}

                {isPending && (
                  <Link
                    href={`/payment/status?orderId=${orderId || ""}&reference=${reference || ""}`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <RefreshCw className="size-4" />
                    Refresh Status
                  </Link>
                )}
              </div>
            </div>

            {/* Security footer banner */}
            <div className="flex items-center justify-center gap-2 border-t border-border bg-muted/10 py-3 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Payments securely processed by OPay Checkout</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
