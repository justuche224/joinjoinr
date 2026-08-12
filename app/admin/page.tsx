import React from "react";
import { headers } from "next/headers";
import { CalendarClock } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session?.user.role !== "admin") return redirect("/")
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
      <p className="font-mono text-xs tracking-[0.25em] text-brass-ink uppercase">
        Dashboard
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Welcome, {session?.user.name?.split(" ")[0]}.
      </h1>

      <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-24 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CalendarClock className="size-5" />
        </div>
        <p className="mt-4 font-heading text-xl font-semibold text-foreground">
          No tickets yet
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Once you buy tickets, they&apos;ll show up here — along with your
          order history and saved events.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
