"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { cn, formatKoboToNaira } from "@/lib/utils";
import type { Session } from "@/lib/events";

const TicketPanel = ({ sessions }: { sessions: Session[] }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-heading text-lg font-medium text-foreground">
          Tickets Coming Soon
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sessions and ticket tiers have not been announced yet. Check back soon!
        </p>
      </div>
    );
  }

  const [selectedId, setSelectedId] = useState(sessions[0]?.id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const session = sessions.find((s) => s.id === selectedId) ?? sessions[0];

  const setQty = (tierName: string, delta: number) => {
    const key = `${session.id}:${tierName}`;
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }));
  };

  const ticketCount = (session.tiers || []).reduce(
    (sum, tier) => sum + (quantities[`${session.id}:${tier.name}`] ?? 0),
    0
  );
  const total = (session.tiers || []).reduce(
    (sum, tier) =>
      sum + (quantities[`${session.id}:${tier.name}`] ?? 0) * tier.price,
    0
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {sessions.length > 1 && (
        <div className="mb-6">
          <p className="mb-3 font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
            Choose a date
          </p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer",
                  s.id === session.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/40"
                )}
              >
                <span className="block text-sm font-medium">{s.label}</span>
                <span
                  className={cn(
                    "block text-xs",
                    s.id === session.id
                      ? "text-background/70"
                      : "text-muted-foreground"
                  )}
                >
                  {s.time}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(!session.tiers || session.tiers.length === 0) ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No ticket tiers available for this session.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {session.tiers.map((tier) => {
            const key = `${session.id}:${tier.name}`;
            const qty = quantities[key] ?? 0;
            return (
              <div
                key={tier.name}
                className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{tier.name}</p>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-sm font-medium text-brass-ink">
                    {formatKoboToNaira(tier.price)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(tier.name, -1)}
                    disabled={qty === 0}
                    aria-label={`Remove one ${tier.name} ticket`}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground/40 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center font-mono text-sm tabular-nums text-foreground">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(tier.name, 1)}
                    aria-label={`Add one ${tier.name} ticket`}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground/40 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {ticketCount} {ticketCount === 1 ? "ticket" : "tickets"}
          </p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {formatKoboToNaira(total)}
          </p>
        </div>
        <Button
          disabled={ticketCount === 0}
          className="btn-ticket btn-ticket-card h-12 rounded-xl bg-brass px-8 text-[0.9rem] font-semibold text-stage hover:bg-brass/90 disabled:opacity-40"
        >
          Get tickets
        </Button>
      </div>
    </div>
  );
};

export default TicketPanel;
