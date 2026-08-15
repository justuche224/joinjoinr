import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { event as eventTable } from "@/db/schema";

export type Category = "Concerts" | "Sports" | "Theatre" | "Festivals";

export const categories: Category[] = [
  "Sports",
  "Concerts",
  "Theatre",
  "Festivals",
];

export type TicketTier = {
  id?: string;
  name: string;
  price: number; // in kobo
  description?: string | null;
  capacity?: number;
};

export type Session = {
  id: string;
  label: string;
  time: string;
  datetime: string | Date;
  doors?: string | null;
  tiers: TicketTier[];
};

export type EventDetail = {
  id?: string;
  slug: string;
  category: Category;
  title: string;
  venue: string;
  city: string;
  address: string;
  image: string;
  images?: string[];
  imageAlt?: string;
  description: string;
  sessions: Session[];
};

export function getPrimaryImage(img: string): string {
  if (!img) return "";
  if (img.startsWith("[")) {
    try {
      const parsed = JSON.parse(img);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {
      // fallback
    }
  }
  return img;
}

export function getAllImages(img: string): string[] {
  if (!img) return [];

  if (img.startsWith("[")) {
    try {
      const parsed = JSON.parse(img);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
  }
  return [img];
}

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


export function startingPrice(event: EventDetail): number | null {
  if (!event.sessions || event.sessions.length === 0) return null;
  const allTiers = event.sessions.flatMap((s) => s.tiers || []);
  if (allTiers.length === 0) return null;
  return Math.min(...allTiers.map((tier) => tier.price));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthDay(datetime?: string | Date | null): { month: string; day: string } {
  if (!datetime) {
    return { month: "TBA", day: "--" };
  }
  const date = new Date(datetime);
  if (isNaN(date.getTime())) {
    return { month: "TBA", day: "--" };
  }
  return {
    month: MONTHS[date.getMonth()],
    day: String(date.getDate()).padStart(2, "0"),
  };
}
