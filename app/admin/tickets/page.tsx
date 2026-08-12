import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { QrCode, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { verifyTicket } from "@/actions/admin";
import { buttonVariants } from "@/components/ui/button";

const AdminTicketsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; success?: string }>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { message, success } = await searchParams;

  // Fetch recently scanned tickets
  const recentScans = await db.query.ticket.findMany({
    where: { scannedAt: { isNotNull: true } },
    orderBy: { scannedAt: "desc" },
    limit: 10,
    with: {
      user: true,
      session: {
        with: {
          event: true,
        },
      },
      tier: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Ticket Scanner
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a ticket code to verify it for entry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        {/* Scanner Form */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
              <ScanLine className="size-6" />
            </div>
            
            <form action={verifyTicket} className="space-y-4">
              <div>
                <label htmlFor="code" className="text-sm font-medium text-foreground">
                  Ticket Code
                </label>
                <div className="mt-2 flex gap-3">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    placeholder="e.g. TKT-12345678"
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-4 py-2 font-mono text-sm tracking-widest text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    autoComplete="off"
                    autoFocus
                  />
                  <button type="submit" className={buttonVariants({ variant: "default", size: "lg" })}>
                    Verify
                  </button>
                </div>
              </div>
            </form>

            {message && (
              <div className={`mt-6 flex items-start gap-3 rounded-lg border p-4 ${success === 'true' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600' : 'border-destructive/20 bg-destructive/10 text-destructive'}`}>
                {success === 'true' ? <CheckCircle2 className="mt-0.5 size-5" /> : <AlertCircle className="mt-0.5 size-5" />}
                <div>
                  <p className="text-sm font-medium">{success === 'true' ? 'Valid Ticket' : 'Invalid Ticket'}</p>
                  <p className="text-sm opacity-90">{message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div>
          <h2 className="mb-4 font-heading text-lg font-medium text-foreground flex items-center gap-2">
            <QrCode className="size-4 text-muted-foreground" />
            Recent Scans
          </h2>
          
          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets scanned yet.</p>
            ) : (
              recentScans.map((scan) => (
                <div key={scan.id} className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
                  <p className="font-medium text-foreground">{scan.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{scan.session.event.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">{scan.code.slice(0, 8)}</span>
                    <span className="text-emerald-500 font-medium">Scanned</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;
