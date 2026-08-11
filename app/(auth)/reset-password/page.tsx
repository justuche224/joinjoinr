import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) => {
  const { token, error } = await searchParams;

  if (error || !token) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
          Link expired
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That reset link is invalid or has expired. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-brass-ink hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
};

export default ResetPasswordPage;
