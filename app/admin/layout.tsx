import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/auth/sign-out-button";
import { CalendarDays, LayoutDashboard, Ticket, QrCode } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

if(!session) return redirect("/")
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background/50 backdrop-blur-xl">
        <div className="flex h-16 shrink-0 items-center px-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-brass"
          >
            JoinJoinR <span className="text-brass-ink font-mono text-xs uppercase ml-1">Admin</span>
          </Link>
        </div>
        
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="size-4" />
            Overview
          </Link>
          <Link
            href="/admin/events"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <CalendarDays className="size-4" />
            Events
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Ticket className="size-4" />
            Orders
          </Link>
          <Link
            href="/admin/tickets"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <QrCode className="size-4" />
            Scanner
          </Link>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium text-foreground">
                {session.user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Admin
              </span>
            </div>
          </div>
          <div className="mt-3 px-1">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}
