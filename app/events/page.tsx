import React from "react";
import EventsBrowser from "@/components/events/events-browser";
import Footer from "@/components/shared/footer";
import { categories, getEvents } from "@/lib/events";

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

