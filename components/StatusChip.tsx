import type { DrinkStatus } from "@/lib/drink-status";

export function StatusChip({ status }: { status: DrinkStatus }) {
  const styles: Record<DrinkStatus, string> = {
    "Ready": "chip-ready",
    "Drink now": "chip-soon",
    "Too young": "chip-hold",
    "Past peak": "chip-past",
    "Out of stock": "chip-default",
    "No window": "chip-default"
  };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "chip-default"}`}>
      {status}
    </span>
  );
}
