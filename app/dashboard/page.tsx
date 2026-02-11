import { Suspense } from "react";
import DashboardContent from "@/components/contents/dashboard";
import { getDashboardData } from "@/server/actions/dashboard";

// ─── Async inner component ─────────────────────────────────────────────────────
// Doing the data-fetch here (inside Suspense) means the page streams in with a
// skeleton while the DB query runs, identical to how AdminContent works.

async function DashboardFetcher() {
  const data = await getDashboardData();
  return <DashboardContent data={data} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard…</p>
          </div>
        </div>
      }
    >
      <DashboardFetcher />
    </Suspense>
  );
}
