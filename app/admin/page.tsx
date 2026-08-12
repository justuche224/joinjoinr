import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { event, order, ticket } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { CalendarDays, Ticket, CreditCard, Users } from "lucide-react";

const AdminDashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch high level stats
  const [eventsCount] = await db.select({ count: count() }).from(event);
  const [ordersCount] = await db.select({ count: count() }).from(order);
  const [ticketsCount] = await db.select({ count: count() }).from(ticket);
  
  // Just grabbing valid tickets as active
  const [validTicketsCount] = await db.select({ count: count() }).from(ticket).where(eq(ticket.status, "valid"));

  const stats = [
    {
      name: "Total Events",
      value: eventsCount.count,
      icon: CalendarDays,
      description: "Active events in the system",
    },
    {
      name: "Total Orders",
      value: ordersCount.count,
      icon: CreditCard,
      description: "Purchases made",
    },
    {
      name: "Tickets Sold",
      value: ticketsCount.count,
      icon: Ticket,
      description: "Total tickets issued",
    },
    {
      name: "Valid Tickets",
      value: validTicketsCount.count,
      icon: Users,
      description: "Awaiting scan at doors",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to the admin panel. Here is a high-level overview of the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-brass-ink">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </p>
                  <p className="font-heading text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
