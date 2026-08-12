"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { event, eventSession, ticketTier, ticket } from "@/db/schema";
import { redirect } from "next/navigation";

// Utility to verify admin
async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function createEvent(formData: FormData) {
  await verifyAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;
  const venue = formData.get("venue") as string;
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;
  const image = formData.get("image") as string;
  const description = formData.get("description") as string;
  
  // Create id
  const id = crypto.randomUUID();

  await db.insert(event).values({
    id,
    title,
    slug,
    category,
    venue,
    city,
    address,
    image,
    imageAlt: `Image for ${title}`,
    description,
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${id}`);
}

export async function createSession(eventId: string, formData: FormData) {
  await verifyAdmin();

  const label = formData.get("label") as string;
  const time = formData.get("time") as string;
  const datetime = formData.get("datetime") as string;
  const doors = formData.get("doors") as string;

  const id = crypto.randomUUID();

  await db.insert(eventSession).values({
    id,
    eventId,
    label,
    time,
    datetime: new Date(datetime),
    doors: doors || null,
  });

  revalidatePath(`/admin/events/${eventId}`);
}

export async function createTier(sessionId: string, eventId: string, formData: FormData) {
  await verifyAdmin();

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const capacity = parseInt(formData.get("capacity") as string, 10);
  const description = formData.get("description") as string;

  const id = crypto.randomUUID();

  await db.insert(ticketTier).values({
    id,
    sessionId,
    name,
    price,
    capacity,
    description: description || null,
  });

  revalidatePath(`/admin/events/${eventId}`);
}

export async function verifyTicket(formData: FormData): Promise<void> {
  await verifyAdmin();

  const code = formData.get("code") as string;
  if (!code) throw new Error("Ticket code is required");

  const redirectWithMessage = (success: boolean, message: string): never => {
    const params = new URLSearchParams({
      success: String(success),
      message,
    });

    redirect(`/admin/tickets?${params.toString()}`);
  };

  // Find ticket
  const t = await db.query.ticket.findFirst({
    where: { code },
  });

  if (!t) {
    return redirectWithMessage(false, "Ticket not found");
  }

  if (t.status === "scanned") {
    return redirectWithMessage(false, "Ticket already scanned");
  }

  if (t.status !== "valid") {
    return redirectWithMessage(false, `Ticket is ${t.status}`);
  }

  // Update status
  await db.update(ticket).set({
    status: "scanned",
    scannedAt: new Date(),
  }).where(eq(ticket.id, t.id));

  revalidatePath("/admin/tickets");
  return redirectWithMessage(true, "Ticket successfully verified and scanned!");
}
