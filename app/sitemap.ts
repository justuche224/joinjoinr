import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { event } from "@/db/schema";

const siteUrl = "https://www.joinjoinr.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await db
    .select({ slug: event.slug, updatedAt: event.updatedAt })
    .from(event);

  const eventEntries: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${siteUrl}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/events`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...eventEntries,
  ];
}
