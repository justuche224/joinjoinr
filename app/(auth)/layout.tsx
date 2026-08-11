import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stage px-6 py-16">
      <Link
        href="/"
        className="mb-8 font-heading text-lg font-semibold tracking-tight text-white"
      >
        JoinJoinR
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        {children}
      </div>
    </div>
  );
}
