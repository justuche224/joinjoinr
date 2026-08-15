import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock, Ticket as TicketIcon, Calendar, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticket, eventSession, event, ticketTier } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatKoboToNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userTickets = await db
    .select({
      ticket: ticket,
      session: eventSession,
      tier: ticketTier,
      event: event,
    })
    .from(ticket)
    .innerJoin(eventSession, eq(ticket.sessionId, eventSession.id))
    .innerJoin(event, eq(eventSession.eventId, event.id))
    .innerJoin(ticketTier, eq(ticket.tierId, ticketTier.id))
    .where(eq(ticket.userId, session.user.id))
    .orderBy(desc(ticket.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
            Dashboard
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome, {session.user.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your purchased tickets and view event details.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
        >
          Explore More Events
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {userTickets.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border py-24 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarClock className="size-5" />
          </div>
          <p className="mt-4 font-heading text-xl font-semibold text-foreground">
            No tickets yet
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Once you buy tickets, they&apos;ll show up here — along with your order history and verification QR codes.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
            Your Tickets ({userTickets.length})
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userTickets.map(({ ticket: t, session: s, tier, event: ev }) => (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-foreground/20"
              >
                {/* Event Image Banner */}
                <div className="relative aspect-16/9 overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-mono font-medium backdrop-blur-sm">
                    {t.status === "valid" ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Valid
                      </span>
                    ) : (
                      <span className="capitalize text-muted-foreground">{t.status}</span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <span className="font-mono text-[11px] tracking-wider text-brass-ink uppercase">
                    {ev.category}
                  </span>
                  <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight text-foreground line-clamp-1">
                    {ev.title}
                  </h3>

                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{s.label} ({s.time})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="line-clamp-1">{ev.venue}, {ev.city}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Tier</p>
                      <p className="font-medium text-foreground">{tier.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Paid</p>
                      <p className="font-mono font-semibold text-brass-ink">
                        {formatKoboToNaira(tier.price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Ticket Code
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wider text-foreground">
                      {t.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
