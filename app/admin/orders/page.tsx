import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
          <CheckCircle2 className="size-3" />
          Paid
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
          <Clock className="size-3" />
          Pending
        </span>
      );
    case "cancelled":
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          <XCircle className="size-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    default:
      return null;
  }
};

const AdminOrdersPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const orders = await db.query.order.findMany({
    orderBy: { createdAt: "desc" },
    with: {
      user: true,
      tickets: true,
    },
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Recent Orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View all ticket purchases and their payment status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CreditCard className="size-5" />
          </div>
          <p className="mt-4 font-heading text-xl font-semibold text-foreground">
            No orders found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Once users buy tickets, their orders will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/20 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-muted/10">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{o.user.name}</div>
                    <div className="text-xs text-muted-foreground">{o.user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-brass-ink">
                    ₦{(o.totalAmount / 100).toFixed(2)}
                    <div className="text-xs text-muted-foreground mt-0.5">{o.tickets.length} ticket(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {o.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
