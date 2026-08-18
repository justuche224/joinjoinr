"use client";

import React, { useState, useTransition } from "react";
import { Save, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { updateEvent, deleteEvent } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/utils";

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    venue: string;
    city: string;
    address: string;
    image: string;
    description: string;
  };
}

export function EditEventForm({ event }: EditEventFormProps) {
  const [title, setTitle] = useState(event.title);
  const [slug, setSlug] = useState(event.slug);
  const [isSlugEdited, setIsSlugEdited] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugEdited) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    setSlug(newSlug);
    if (!newSlug || newSlug === slugify(title)) {
      setIsSlugEdited(false);
    } else {
      setIsSlugEdited(true);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteEvent(event.id);
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    });
  };

  return (
    <div className="space-y-8">
      <form
        action={updateEvent.bind(null, event.id)}
        className="space-y-8 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
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
              value={title}
              onChange={handleTitleChange}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. The Midnight Parade"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="text-sm font-medium text-foreground">
                Slug (URL)
              </label>
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(title));
                  setIsSlugEdited(false);
                }}
                className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground cursor-pointer"
              >
                Auto-generate
              </button>
            </div>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
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
              defaultValue={event.category}
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
            <label className="text-sm font-medium text-foreground">
              Event Images (Cover & Gallery)
            </label>
            <ImageUploader
              name="image"
              defaultValue={event.image}
              required
              maxFiles={5}
              maxFileSizeMb={10}
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
              defaultValue={event.venue}
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
              defaultValue={event.city}
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
              defaultValue={event.address}
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
              defaultValue={event.description}
              required
              rows={5}
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
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4" /> Delete Event
            </h3>
            <p className="text-xs text-muted-foreground">
              Permanently delete this event along with all its sessions and ticket tiers. This action cannot be undone.
            </p>
          </div>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className={buttonVariants({ variant: "destructive", size: "sm" })}
              >
                {isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isPending}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground",
              })}
            >
              <Trash2 className="mr-1.5 size-3.5" /> Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
