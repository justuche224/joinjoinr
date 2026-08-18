import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { createSession } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { SessionCard } from "@/components/admin/session-card";

const AdminEventDetail = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  const eventData = await db.query.event.findFirst({
    where: { id },
    with: {
      sessions: {
        with: {
          tiers: true,
        },
      },
    },
  });

  if (!eventData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Events
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              {eventData.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {eventData.venue} • {eventData.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${eventData.slug}`}
              target="_blank"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5" })}
            >
              <ExternalLink className="size-3.5" />
              View Live
            </Link>
            <Link
              href={`/admin/events/${id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
            >
              <Pencil className="size-3.5" />
              Edit Event
            </Link>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_350px]">
        <div className="space-y-12">
          {/* Sessions List */}
          <section>
            <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
              Sessions & Tiers
            </h2>
            
            {eventData.sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No sessions added yet.
              </div>
            ) : (
              <div className="space-y-8">
                {eventData.sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    eventId={eventData.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Add Session */}
        <div>
          <div className="sticky top-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Add Session
            </h3>
            <form action={createSession.bind(null, eventData.id)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Label</label>
                <input name="label" type="text" placeholder="e.g. Day 1, VIP Night" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Date & Time</label>
                <input name="datetime" type="datetime-local" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Display Time</label>
                <input name="time" type="text" placeholder="e.g. 7:00 PM" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Doors Open (Optional)</label>
                <input name="doors" type="text" placeholder="e.g. 6:00 PM" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <button type="submit" className={buttonVariants({ variant: "default", className: "w-full" })}>
                Create Session
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventDetail;
