import React from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { EditEventForm } from "@/components/admin/edit-event-form";

const EditEventPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  const eventData = await db.query.event.findFirst({
    where: { id },
  });

  if (!eventData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <div className="mb-8">
        <Link
          href={`/admin/events/${id}`}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Event
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Edit Event
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update event details, photos, venue, and description.
        </p>
      </div>

      <EditEventForm event={eventData} />
    </div>
  );
};

export default EditEventPage;
