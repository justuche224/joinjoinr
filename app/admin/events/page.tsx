import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus, MapPin, CalendarDays, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";

const AdminEventsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const events = await db.query.event.findMany({
    orderBy: { createdAt: "desc" },
    with: {
      sessions: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Events
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your events, sessions, and ticket tiers.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className={buttonVariants({ variant: "default", className: "gap-2" })}
        >
          <Plus className="size-4" />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="size-5" />
          </div>
          <p className="mt-4 font-heading text-xl font-semibold text-foreground">
            No events found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t created any events yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/admin/events/${e.id}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-brass-ink/30 hover:shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.image}
                    alt={e.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-brass transition-colors">
                    {e.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {e.venue}, {e.city}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {e.sessions.length} Session{e.sessions.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
