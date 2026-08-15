"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { createEvent } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/utils";

export function CreateEventForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

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

  return (
    <form
      action={createEvent}
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
            {isSlugEdited && (
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
            )}
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
          <ImageUploader name="image" required maxFiles={5} maxFileSizeMb={10} />
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
  );
}
