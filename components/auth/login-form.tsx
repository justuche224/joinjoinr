"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import FormField from "./form-field";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setUnverified(false);
    if (!validate()) return;

    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes("not verified")) {
        setUnverified(true);
      } else {
        setFormError(error.message ?? "Couldn't sign you in. Check your details and try again.");
      }
      return;
    }
    router.push("/dashboard");
  };

  const handleResend = async () => {
    await authClient.sendVerificationEmail({ email, callbackURL: "/verify-email" });
    setResent(true);
  };

  return (
    <div>
      <p className="mb-2 font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
        Account
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
        Log in
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Welcome back — pick up where you left off.
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
          error={fieldErrors.email}
        />
        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <Link
            href="/forgot-password"
            className="mt-2 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        {unverified && (
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
            <p>Your email isn&apos;t verified yet.</p>
            {resent ? (
              <p className="mt-1 text-muted-foreground">New link sent — check your inbox.</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="mt-1 font-medium text-brass-ink hover:underline"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}
        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="btn-ticket btn-ticket-card mt-1 h-12 w-full rounded-xl bg-brass text-[0.9rem] font-semibold text-stage hover:bg-brass/90"
        >
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        Or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl"
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
