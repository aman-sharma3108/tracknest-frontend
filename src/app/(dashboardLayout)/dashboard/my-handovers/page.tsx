import { handoverService } from "@/services/handover.service";
import { itemService } from "@/services/item.service";
import { userService } from "@/services/user.service";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyHandoversPage() {
  const { data, error } = await handoverService.getMyHandovers();

  // Resolve found item titles and staff names for display
  const handovers = data?.items ?? [];

  // Fetch found items in bulk (up to 100)
  const foundRes = handovers.length > 0
    ? await itemService.getAllFoundItems({ pageSize: 100 })
    : null;

  const foundItemsMap: Record<string, string> = Object.fromEntries(
    (foundRes?.data?.items ?? []).map((item) => [item.id, item.title])
  );

  // Fetch all users (admin endpoint) to resolve staff names
  const usersRes = handovers.length > 0
    ? await userService.getAllUsers()
    : null;

  const usersMap: Record<string, string> = Object.fromEntries(
    (usersRes?.data?.items ?? []).map((u: { id: string; firstName: string; lastName?: string }) => [
      u.id,
      `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""}`,
    ])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Handovers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items that have been handed over to you
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {!error && handovers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
          No items have been handed over to you yet.
        </div>
      )}

      {handovers.length > 0 && (
        <div className="flex flex-col gap-4">
          {handovers.map((handover) => {
            const itemTitle = foundItemsMap[handover.foundItem] ?? "Unknown item";
            const staffName = usersMap[handover.handedOverBy] ?? "Staff member";

            return (
              <div
                key={handover.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Handed Over</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(handover.handedOverAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Item</span>
                      <span className="font-medium text-foreground">{itemTitle}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Handed over by</span>
                      <span className="text-foreground">{staffName}</span>
                    </div>
                    {handover.note && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-28 shrink-0">Note</span>
                        <span className="text-foreground">{handover.note}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/my-handovers/${handover.id}`}
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
