"use client";

import React, { useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  DoorOpen,
  Pencil,
  Trash2,
  Users,
  Plus,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { updateSession, deleteSession, createTier, deleteTier } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { formatKoboToNaira } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string | null;
}

interface Session {
  id: string;
  eventId: string;
  label: string;
  time: string;
  datetime: Date | string;
  doors: string | null;
  tiers: Tier[];
}

interface SessionCardProps {
  session: Session;
  eventId: string;
}

function toDatetimeLocal(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function SessionCard({ session, eventId }: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [tierPrice, setTierPrice] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateSession(session.id, eventId, formData);
        setIsEditing(false);
      } catch (err) {
        console.error("Failed to update session:", err);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSession(session.id, eventId);
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    });
  };

  const handleAddTier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await createTier(session.id, eventId, formData);
        form.reset();
        setTierPrice("");
      } catch (err) {
        console.error("Failed to create tier:", err);
      }
    });
  };

  const handleDeleteTier = (tierId: string) => {
    startTransition(async () => {
      try {
        await deleteTier(tierId, eventId);
      } catch (err) {
        console.error("Failed to delete tier:", err);
      }
    });
  };

  const sessionDate = new Date(session.datetime);
  const dateFormatted = !isNaN(sessionDate.getTime())
    ? sessionDate.toLocaleDateString()
    : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all">
      {/* Session Header / Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="border-b border-border bg-muted/30 p-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Edit Session
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <X className="mr-1.5 size-3.5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 size-3.5" />
                )}
                Save Changes
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Session Label</label>
              <input
                type="text"
                name="label"
                defaultValue={session.label}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. Day 1, VIP Night"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Date & Time</label>
              <input
                type="datetime-local"
                name="datetime"
                defaultValue={toDatetimeLocal(session.datetime)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Display Time</label>
              <input
                type="text"
                name="time"
                defaultValue={session.time}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. 7:00 PM"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Doors Open (Optional)
              </label>
              <input
                type="text"
                name="doors"
                defaultValue={session.doors || ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. 6:00 PM"
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 px-6 py-4">
          <div>
            <h3 className="font-heading text-lg font-medium text-foreground">
              {session.label}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" /> {dateFormatted}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> {session.time}
              </span>
              {session.doors && (
                <span className="flex items-center gap-1.5">
                  <DoorOpen className="size-3.5" /> Doors: {session.doors}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-1">
                <span className="px-2 text-xs font-medium text-destructive">Delete session?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className={buttonVariants({ variant: "destructive", size: "xs" })}
                >
                  {isPending ? <Loader2 className="size-3 animate-spin" /> : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isPending}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Pencil className="mr-1.5 size-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                  })}
                  title="Delete Session"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ticket Tiers Section */}
      <div className="p-6">
        <h4 className="mb-4 text-sm font-medium text-foreground">Ticket Tiers</h4>
        {session.tiers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tiers configured.</p>
        ) : (
          <div className="grid gap-3">
            {session.tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{tier.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3" /> {tier.capacity} capacity
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm font-semibold text-brass-ink">
                    {formatKoboToNaira(tier.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.id)}
                    disabled={isPending}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                    title="Delete Tier"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Tier Form */}
        <form onSubmit={handleAddTier} className="mt-6 border-t border-border pt-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Add New Tier
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 items-start">
            <input
              type="text"
              name="name"
              placeholder="Tier Name"
              required
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="space-y-1">
              <input
                type="number"
                name="price"
                placeholder="Price (Kobo)"
                required
                min="0"
                value={tierPrice}
                onChange={(e) => setTierPrice(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {tierPrice !== "" && !isNaN(Number(tierPrice)) && (
                <div className="flex items-center gap-1.5 text-xs text-brass-ink">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">in Naira:</span>
                  <span className="font-mono font-semibold">{formatKoboToNaira(tierPrice)}</span>
                </div>
              )}
            </div>
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              required
              min="1"
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={isPending}
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 w-full" })}
            >
              {isPending ? (
                <Loader2 className="mr-2 size-3 animate-spin" />
              ) : (
                <Plus className="mr-2 size-3" />
              )}
              Add Tier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

