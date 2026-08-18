import React from "react";
import type { Metadata } from "next";
import EventsBrowser from "@/components/events/events-browser";
import Footer from "@/components/shared/footer";
import { categories, getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Browse concerts, sports, theatre, and festivals. Find your next event and book tickets in seconds.",
  alternates: {
    canonical: "/events",
  },
}

const EventsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) => {
  const { category } = await searchParams;
  const initialCategory = categories.find((c) => c === category);
  const allEvents = await getEvents();

  return (
    <>
      <EventsBrowser allEvents={allEvents} initialCategory={initialCategory} />
      <Footer />
    </>
  );
};

export default EventsPage;

