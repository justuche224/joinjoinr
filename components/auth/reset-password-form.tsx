"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { isStrongPassword, passwordRequirementsText } from "@/lib/password";
import { Button } from "../ui/button";
import FormField from "./form-field";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors: typeof fieldErrors = {};
    if (!isStrongPassword(password)) errors.password = passwordRequirementsText;
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);

    if (error) {
      setFormError(
        error.message ?? "That link is invalid or has expired. Request a new one."
      );
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brass/15 text-brass-ink">
          <Check className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been reset. You can log in now.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-brass-ink hover:underline"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
        Password reset
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
        Set a new password
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Make it something you&apos;ll remember.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <FormField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        {!fieldErrors.password && (
          <p className="-mt-2.5 text-xs text-muted-foreground">{passwordRequirementsText}</p>
        )}
        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="btn-ticket btn-ticket-card mt-1 h-12 w-full rounded-xl bg-brass text-[0.9rem] font-semibold text-stage hover:bg-brass/90"
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
