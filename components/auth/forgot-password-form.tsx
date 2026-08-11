"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import FormField from "./form-field";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brass/15 text-brass-ink">
          <Check className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for <span className="text-foreground">{email}</span>, a
          reset link is on its way.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-brass-ink hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Reset your password
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" disabled={loading} className="mt-1 h-11">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
