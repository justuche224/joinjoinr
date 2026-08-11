"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { isStrongPassword, passwordRequirementsText } from "@/lib/password";
import { Button } from "../ui/button";
import FormField from "./form-field";

type Errors = { name?: string; email?: string; password?: string; confirmPassword?: string };

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errors: Errors = {};
    if (!name.trim()) errors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!isStrongPassword(password)) errors.password = passwordRequirementsText;
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email,
      password,
      callbackURL: "/verify-email",
    });
    setLoading(false);

    if (error) {
      setFormError(error.message ?? "Couldn't create your account. Try again.");
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
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to <span className="text-foreground">{email}</span>.
          Click it to activate your account.
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
        Create an account
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Get personalized picks and faster checkout.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <FormField
          id="name"
          label="Name"
          autoComplete="name"
          placeholder="Jordan Ellis"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
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
        <FormField
          id="password"
          label="Password"
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
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={loading} className="mt-1 h-11">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
