import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { events, getEventBySlug } from "@/lib/events";
import EventHero from "@/components/events/event-hero";
import TicketPanel from "@/components/events/ticket-panel";
import Footer from "@/components/shared/footer";

export async function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

const EventPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const nextSession = event.sessions[0];

  return (
    <>
      <EventHero event={event} nextSession={nextSession} />

      <section className="bg-background px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All events
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
            <div className="order-last lg:order-first">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                About this event
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {event.description}
              </p>

              <div className="mt-10 border-t border-border pt-8">
                <p className="font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
                  Venue
                </p>
                <p className="mt-2 font-medium text-foreground">
                  {event.venue}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.address}
                </p>
              </div>
            </div>

            <div className="order-first lg:order-last">
              <div className="lg:sticky lg:top-24">
                <TicketPanel sessions={event.sessions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default EventPage;
