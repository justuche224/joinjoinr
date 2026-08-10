import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type Category = "Concerts" | "Sports" | "Theatre" | "Festivals";

const categoryColor: Record<Category, string> = {
  Concerts: "text-brass-ink",
  Sports: "text-[#4A6584]",
  Theatre: "text-[#7A4C77]",
  Festivals: "text-[#3F6B4E]",
};

const events: {
  category: Category;
  title: string;
  venue: string;
  city: string;
  month: string;
  day: string;
  price: string;
  image: string;
  imageAlt: string;
}[] = [
  {
    category: "Concerts",
    title: "The Midnight Parade",
    venue: "Bellwood Amphitheater",
    city: "Austin, TX",
    month: "Aug",
    day: "22",
    price: "from $48",
    image: "/images/events/concerts.jpg",
    imageAlt: "A crowd facing a colorful stage light show at an outdoor night concert",
  },
  {
    category: "Sports",
    title: "FC Union vs. Ironside",
    venue: "Harbor Stadium",
    city: "Portland, OR",
    month: "Sep",
    day: "05",
    price: "from $32",
    image: "/images/events/sports.jpg",
    imageAlt: "Fans watching a soccer match from the stands under stadium floodlights",
  },
  {
    category: "Theatre",
    title: "A Winter's Hush",
    venue: "Aldgate Playhouse",
    city: "Chicago, IL",
    month: "Sep",
    day: "14",
    price: "from $65",
    image: "/images/events/theatre.jpg",
    imageAlt: "Rows of empty seats facing a small, ornate theatre stage",
  },
  {
    category: "Festivals",
    title: "Lowland Festival — Day Pass",
    venue: "Greenfield Park",
    city: "Denver, CO",
    month: "Oct",
    day: "03",
    price: "from $89",
    image: "/images/events/festivals.jpg",
    imageAlt: "A crowd gathered in front of a large, colorful festival main stage at sunset",
  },
];

const FeaturedEvents = () => {
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
          <Button variant="ghost" className="gap-1.5 text-foreground">
            View all events
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <article
              key={event.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/25"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-muted">
                <Image
                  src={event.image}
                  alt={event.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <span
                  className={cn(
                    "font-mono text-[11px] tracking-[0.15em] uppercase",
                    categoryColor[event.category]
                  )}
                >
                  {event.category}
                </span>
                <h3 className="font-heading text-xl leading-snug font-semibold tracking-tight text-foreground">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {event.venue} · {event.city}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-border px-6 py-5">
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-xs tracking-wide text-muted-foreground uppercase">
                    {event.month}
                  </span>
                  <span className="text-2xl font-semibold text-foreground">
                    {event.day}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-foreground">
                    {event.price}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
