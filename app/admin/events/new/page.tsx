import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createEvent } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";

const CreateEventPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Events
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Create New Event
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the details below to create a new event. You can add sessions and tickets later.
        </p>
      </div>

      <form action={createEvent} className="space-y-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Event Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. The Midnight Parade"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-foreground">
              Slug (URL)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. the-midnight-parade"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Concerts">Concerts</option>
              <option value="Sports">Sports</option>
              <option value="Theatre">Theatre</option>
              <option value="Festivals">Festivals</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="venue" className="text-sm font-medium text-foreground">
              Venue Name
            </label>
            <input
              id="venue"
              name="venue"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Bellwood Amphitheater"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-foreground">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Austin, TX"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-foreground">
              Full Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. 2200 Riverside Dr, Austin, TX"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Tell attendees about this event..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className={buttonVariants({ variant: "default", className: "gap-2" })}
          >
            <Save className="size-4" />
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
