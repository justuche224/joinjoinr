import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "../ui/button";
import EventCard from "../events/event-card";
import { getFeaturedEvents } from "@/lib/events";

const FeaturedEvents = async () => {
  const events = await getFeaturedEvents(8);

  return (
    <section className="bg-background px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
              Featured events
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              What&apos;s on sale right now
            </h2>
          </div>
          <Link
            href="/events"
            className={buttonVariants({ variant: "ghost", className: "gap-1.5 text-foreground" })}
          >
            View all events
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No events on sale right now. Check back soon!
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedEvents;
