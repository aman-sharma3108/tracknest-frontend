import { ItemTable } from "@/components/modules/items/ItemTable";
import { itemService } from "@/services/item.service";
import { userService } from "@/services/user.service";
import { FoundItemStatus, LostItemStatus } from "@/types/item.interface";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PackageSearch,
  PackageCheck,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default async function ReportsPage() {
  const { data: session } = await userService.getSession();
  const role = session?.user?.role as string | undefined;

  // Admin/Staff only
  if (role !== "ADMIN" && role !== "STAFF") {
    redirect("/dashboard");
  }

  const [lostRes, foundRes] = await Promise.all([
    itemService.getAllLostItems({ pageSize: 100 }),
    itemService.getAllFoundItems({ pageSize: 100 }),
  ]);

  const lostItems = lostRes.data?.items ?? [];
  const foundItems = foundRes.data?.items ?? [];
  const error = lostRes.error ?? foundRes.error;

  const openLost = lostItems.filter(
    (i) => i.status === LostItemStatus.OPEN
  ).length;
  const claimRequested = lostItems.filter(
    (i) => i.status === LostItemStatus.CLAIM_REQUESTED
  ).length;
  const returnedFound = foundItems.filter(
    (i) => i.status === FoundItemStatus.RETURNED
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Reports</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Item Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage all lost and found item reports across the system.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lost Reports"
          value={lostItems.length}
          icon={PackageSearch}
          sub={`${openLost} open`}
        />
        <StatCard
          label="Found Reports"
          value={foundItems.length}
          icon={PackageCheck}
          sub={`${returnedFound} returned`}
        />
        <StatCard
          label="Claims Requested"
          value={claimRequested}
          icon={ClipboardList}
          sub="Awaiting action"
        />
        <StatCard
          label="Items Returned"
          value={returnedFound}
          icon={CheckCircle2}
          sub="Successfully handed over"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : (
        <ItemTable lostItems={lostItems} foundItems={foundItems} role={role} />
      )}
    </div>
  );
}
