import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Clock, Users, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { createSession, createTier } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              {eventData.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {eventData.venue} • {eventData.city}
            </p>
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
                  <div key={session.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
                      <div>
                        <h3 className="font-heading text-lg font-medium text-foreground">
                          {session.label}
                        </h3>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Calendar className="size-3.5"/> {session.datetime.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="size-3.5"/> {session.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="mb-4 text-sm font-medium text-foreground">Ticket Tiers</h4>
                      {session.tiers.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No tiers configured.</p>
                      ) : (
                        <div className="grid gap-3">
                          {session.tiers.map((tier) => (
                            <div key={tier.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                              <div>
                                <p className="font-medium text-sm text-foreground">{tier.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                  <Users className="size-3" /> {tier.capacity} capacity
                                </p>
                              </div>
                              <div className="font-mono text-sm font-semibold text-brass-ink">
                                ₦{(tier.price / 100).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Tier Form */}
                      <form action={createTier.bind(null, session.id, eventData.id)} className="mt-6 border-t border-border pt-6">
                        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Add New Tier</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <input type="text" name="name" placeholder="Tier Name" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                          <input type="number" name="price" placeholder="Price (Kobo)" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                          <input type="number" name="capacity" placeholder="Capacity" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <Plus className="mr-2 size-3" /> Add Tier
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
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
