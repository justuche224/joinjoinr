"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-background px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <p className="mb-3 font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
            Stay in the loop
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            New events, picked for you.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tell us your city and we&apos;ll email you when tickets to
            things you&apos;d actually want go on sale.
          </p>
        </div>

        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm text-foreground">
              <Check className="size-4 text-brass-ink" />
              You&apos;re on the list — we&apos;ll be in touch.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" className="h-11 shrink-0 px-6">
                Notify me
              </Button>
            </form>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
