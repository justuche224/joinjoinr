import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn, formatKoboToNaira } from "@/lib/utils";
import { formatMonthDay, startingPrice, type Category, type EventDetail } from "@/lib/events-types";

export const categoryColor: Record<Category, string> = {
  Concerts: "text-brass-ink",
  Sports: "text-[#4A6584]",
  Theatre: "text-[#7A4C77]",
  Festivals: "text-[#3F6B4E]",
};

const EventCard = ({ event }: { event: EventDetail }) => {
  const firstSession = event.sessions?.[0];
  const { month, day } = formatMonthDay(firstSession?.datetime);
  const minPrice = startingPrice(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/25"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.imageAlt || event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span
          className={cn(
            "font-mono text-[11px] tracking-[0.15em] uppercase",
            categoryColor[event.category] || "text-brass-ink"
          )}
        >
          {event.category}
        </span>
        <h3 className="font-heading text-xl leading-snug font-semibold tracking-tight text-foreground line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {event.venue} · {event.city}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-border px-6 py-5">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-xs tracking-wide text-muted-foreground uppercase">
            {month}
          </span>
          <span className="text-2xl font-semibold text-foreground">{day}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-foreground">
            {minPrice !== null ? `from ${formatKoboToNaira(minPrice)}` : "TBA"}
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
