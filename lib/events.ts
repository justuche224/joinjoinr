import "server-only";
import { db } from "@/lib/db";
import type { Category, EventDetail } from "./events-types";
import { getAllImages, getPrimaryImage } from "./events-types";

export * from "./events-types";

export async function getEvents(): Promise<EventDetail[]> {
  try {
    const dbEvents = await db.query.event.findMany({
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      with: {
        sessions: {
          with: {
            tiers: true,
          },
          orderBy: (sessions, { asc }) => [asc(sessions.datetime)],
        },
      },
    });

    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map((e) => ({
        id: e.id,
        slug: e.slug,
        category: e.category as Category,
        title: e.title,
        venue: e.venue,
        city: e.city,
        address: e.address,
        image: getPrimaryImage(e.image),
        images: getAllImages(e.image),
        imageAlt: e.imageAlt || `Image for ${e.title}`,
        description: e.description,
        sessions: e.sessions.map((s) => ({
          id: s.id,
          label: s.label,
          time: s.time,
          datetime: s.datetime instanceof Date ? s.datetime.toISOString() : String(s.datetime),
          doors: s.doors || undefined,
          tiers: s.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            description: t.description || "",
            capacity: t.capacity,
          })),
        })),
      }));
    }
  } catch (error) {
    console.error("Error querying events from database:", error);
  }

  return [];
}

export async function getFeaturedEvents(limit = 4): Promise<EventDetail[]> {
  const all = await getEvents();
  return all.slice(0, limit);
}

export async function getEventBySlug(slug: string): Promise<EventDetail | undefined> {
  try {
    const dbEvent = await db.query.event.findFirst({
      where: { slug },
      with: {
        sessions: {
          with: {
            tiers: true,
          },
          orderBy: (sessions, { asc }) => [asc(sessions.datetime)],
        },
      },
    });

    if (dbEvent) {
      return {
        id: dbEvent.id,
        slug: dbEvent.slug,
        category: dbEvent.category as Category,
        title: dbEvent.title,
        venue: dbEvent.venue,
        city: dbEvent.city,
        address: dbEvent.address,
        image: getPrimaryImage(dbEvent.image),
        images: getAllImages(dbEvent.image),
        imageAlt: dbEvent.imageAlt || `Image for ${dbEvent.title}`,
        description: dbEvent.description,
        sessions: dbEvent.sessions.map((s) => ({
          id: s.id,
          label: s.label,
          time: s.time,
          datetime: s.datetime instanceof Date ? s.datetime.toISOString() : String(s.datetime),
          doors: s.doors || undefined,
          tiers: s.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            description: t.description || "",
            capacity: t.capacity,
          })),
        })),
      };
    }
  } catch (error) {
    console.error("Error querying event by slug from database:", error);
  }

  return undefined;
}
