"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Nav from "../shared/nav";
import EventCard from "./event-card";
import { cn } from "@/lib/utils";
import { events as allEvents, categories, startingPrice, type Category } from "@/lib/events";

const ALL = "All" as const;
type CategoryFilter = Category | typeof ALL;
type SortKey = "soonest" | "price-asc" | "price-desc";

const EventsBrowser = ({ initialCategory }: { initialCategory?: Category }) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(
    initialCategory ?? ALL
  );
  const [sort, setSort] = useState<SortKey>("soonest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allEvents.filter((event) => {
      const matchesCategory =
        activeCategory === ALL || event.category === activeCategory;
      const matchesQuery =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.city.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return startingPrice(a) - startingPrice(b);
      if (sort === "price-desc") return startingPrice(b) - startingPrice(a);
      return (
        new Date(a.sessions[0].datetime).getTime() -
        new Date(b.sessions[0].datetime).getTime()
      );
    });
  }, [query, activeCategory, sort]);

  return (
    <>
      <section className="bg-stage px-6 pt-32 pb-12 md:px-10 md:pb-16">
        <Nav />
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 font-mono text-xs tracking-[0.25em] text-brass uppercase">
            Browse
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            All events
          </h1>
          <p className="mt-3 max-w-md text-white/70">
            Search by name, venue, or city — or filter by category.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues, cities…"
                aria-label="Search events"
                className="h-11 w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/10"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort events"
              className="h-11 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus-visible:border-white/40 sm:w-52"
            >
              <option className="text-stage" value="soonest">
                Soonest first
              </option>
              <option className="text-stage" value="price-asc">
                Price: low to high
              </option>
              <option className="text-stage" value="price-desc">
                Price: high to low
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[ALL, ...categories].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-xs tracking-wide uppercase transition-colors",
                  activeCategory === category
                    ? "border-white bg-white text-stage"
                    : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-24 text-center">
              <p className="font-heading text-xl font-semibold text-foreground">
                No events match that search.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or clear the category filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EventsBrowser;
