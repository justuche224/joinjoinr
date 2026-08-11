import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

const VerifyEmailPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) => {
  const { error } = await searchParams;

  if (error) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Link expired
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That verification link is invalid or has expired. Log in and we&apos;ll
          send you a fresh one.
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
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brass/15 text-brass-ink">
        <Check className="size-6" />
      </div>
      <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Email verified
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;re all set. Log in to continue.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-brass-ink hover:underline"
      >
        Log in
      </Link>
    </div>
  );
};

export default VerifyEmailPage;
