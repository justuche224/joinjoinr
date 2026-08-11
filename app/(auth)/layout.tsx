import React from "react";
import Image from "next/image";
import Link from "next/link";
import heroBg from "@/public/images/hero-bg.jpg";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-stage px-6 py-16">
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-stage/75" />

      <Link
        href="/"
        className="relative mb-8 font-heading text-lg font-semibold tracking-tight text-white"
      >
        JoinJoinR
      </Link>
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/40">
        {children}
      </div>
    </div>
  );
}
