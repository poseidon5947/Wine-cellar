export type DrinkStatus = "Out of stock" | "No window" | "Too young" | "Past peak" | "Drink now" | "Ready";

export function getDrinkStatus(
  quantity: number,
  drinkingWindowStart?: number | null,
  drinkingWindowEnd?: number | null,
  currentYear = new Date().getFullYear()
): DrinkStatus {
  if (quantity === 0) return "Out of stock";
  if (!drinkingWindowStart || !drinkingWindowEnd) return "No window";
  if (currentYear < drinkingWindowStart) return "Too young";
  if (currentYear > drinkingWindowEnd) return "Past peak";
  if (currentYear === drinkingWindowEnd) return "Drink now";
  return "Ready";
}

export function drinkStatusClass(status: DrinkStatus) {
  switch (status) {
    case "Ready":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "Drink now":
      return "bg-amber-100 text-amber-900 ring-amber-200";
    case "Too young":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "Past peak":
      return "bg-rose-100 text-rose-800 ring-rose-200";
    case "Out of stock":
      return "bg-zinc-200 text-zinc-700 ring-zinc-300";
    default:
      return "bg-stone-100 text-stone-700 ring-stone-200";
  }
}
