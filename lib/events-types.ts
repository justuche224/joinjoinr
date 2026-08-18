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
  commentCount?: number;
  likeCount?: number;
  shareCount?: number;
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
