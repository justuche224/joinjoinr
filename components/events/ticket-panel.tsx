"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Minus, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { cn, formatKoboToNaira } from "@/lib/utils";
import type { Session } from "@/lib/events-types";
import { authClient } from "@/lib/auth-client";
import { createEventPaymentCheckout } from "@/actions/payment";

const TicketPanel = ({ sessions }: { sessions: Session[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionAuth, isPending: isAuthLoading } = authClient.useSession();

  const [selectedId, setSelectedId] = useState(sessions?.[0]?.id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  const session = sessions.find((s) => s.id === selectedId) ?? sessions[0];

  const setQty = (tierKey: string, delta: number) => {
    setCheckoutError(null);
    setQuantities((prev) => ({
      ...prev,
      [tierKey]: Math.max(0, (prev[tierKey] ?? 0) + delta),
    }));
  };

  const getTierKey = (tier: { id?: string; name: string }) =>
    tier.id ? `${session.id}:${tier.id}` : `${session.id}:${tier.name}`;

  const ticketCount = (session.tiers || []).reduce(
    (sum, tier) => sum + (quantities[getTierKey(tier)] ?? 0),
    0
  );

  const total = (session.tiers || []).reduce(
    (sum, tier) =>
      sum + (quantities[getTierKey(tier)] ?? 0) * tier.price,
    0
  );

  const handleCheckout = async () => {
    setCheckoutError(null);

    // 1. If not authenticated, redirect to login with callbackUrl
    if (!sessionAuth?.user) {
      const returnPath = pathname || "/events";
      router.push(`/login?callbackUrl=${encodeURIComponent(returnPath)}`);
      return;
    }

    // 2. Prepare items payload
    const items = (session.tiers || [])
      .map((tier) => ({
        tierId: tier.id ?? "",
        quantity: quantities[getTierKey(tier)] ?? 0,
      }))
      .filter((item) => item.tierId && item.quantity > 0);

    if (items.length === 0) {
      setCheckoutError("Please select at least 1 ticket.");
      return;
    }

    try {
      setIsCheckingOut(true);
      const result = await createEventPaymentCheckout({
        sessionId: session.id,
        items,
      });

      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Unable to retrieve checkout URL from payment gateway.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setCheckoutError(
        err.message || "Failed to initiate payment. Please try again."
      );
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
                disabled={isCheckingOut}
                onClick={() => {
                  setSelectedId(s.id);
                  setCheckoutError(null);
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer disabled:opacity-50",
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
            const tierKey = getTierKey(tier);
            const qty = quantities[tierKey] ?? 0;
            return (
              <div
                key={tier.id || tier.name}
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
                    onClick={() => setQty(tierKey, -1)}
                    disabled={qty === 0 || isCheckingOut}
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
                    onClick={() => setQty(tierKey, 1)}
                    disabled={isCheckingOut}
                    aria-label={`Add one ${tier.name} ticket`}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground/40 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkoutError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{checkoutError}</span>
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
          onClick={handleCheckout}
          disabled={ticketCount === 0 || isCheckingOut || isAuthLoading}
          className="btn-ticket btn-ticket-card h-12 rounded-xl bg-brass px-8 text-[0.9rem] font-semibold text-stage hover:bg-brass/90 disabled:opacity-40"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Redirecting…
            </>
          ) : !sessionAuth?.user ? (
            "Log in to buy"
          ) : (
            "Get tickets"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TicketPanel;
