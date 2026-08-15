import React from "react";
import Nav from "../shared/nav";
import Countdown from "./countdown";
import type { EventDetail } from "@/lib/events-types";

const EventHero = ({
  event,
  nextSession,
}: {
  event: EventDetail;
  nextSession?: EventDetail["sessions"][number];
}) => {
  return (
    <section className="relative flex h-[70vh] min-h-125 w-full flex-col overflow-hidden bg-stage">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={event.image}
        alt={event.imageAlt || event.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-stage via-stage/60 to-stage/20" />

      <Nav />

      <div className="relative mt-auto w-full px-6 pt-32 pb-10 md:px-10 md:pb-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 font-mono text-xs tracking-[0.25em] text-brass uppercase">
              {event.category}
            </p>
            <h1 className="max-w-2xl font-heading text-4xl leading-[1.02] font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              {event.title}
            </h1>
            <p className="mt-4 text-white/70">
              {event.venue} · {event.city}
            </p>
          </div>

          {nextSession?.datetime && (
            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
                {event.sessions.length > 1 ? "Next date in" : "Starts in"}
              </p>
              <Countdown target={nextSession.datetime} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventHero;
