import type { Bottle } from "@prisma/client";
import { BOTTLE_SIZES, BOTTLE_STATUSES, WINE_TYPES } from "@/lib/constants";
import { getDrinkStatus } from "@/lib/drink-status";

export type BottleWithDrinkStatus = Bottle & {
  drinkStatus: ReturnType<typeof getDrinkStatus>;
  drinkingWindow: string;
};

export type BottleInput = {
  photoUrl?: string | null;
  producer: string;
  wineName: string;
  vintage?: string | null;
  type?: string | null;
  grapes?: string | null;
  region?: string | null;
  country?: string | null;
  alcoholPercent?: number | null;
  bottleSize?: string | null;
  quantity?: number | null;
  storageLocation?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  status?: string | null;
  personalRating?: number | null;
  notes?: string | null;
  myNotes?: string | null;
  hallidayScore?: number | null;
  hookScore?: number | null;
  rpScore?: number | null;
  larkinScore?: number | null;
  myScore?: number | null;
  others?: string | null;
};

const nullableStringFields = [
  "photoUrl",
  "vintage",
  "grapes",
  "region",
  "country",
  "storageLocation",
  "notes",
  "myNotes",
  "others"
] as const;

const nullableNumberFields = [
  "alcoholPercent",
  "purchasePrice",
  "drinkingWindowStart",
  "drinkingWindowEnd",
  "personalRating",
  "hallidayScore",
  "hookScore",
  "rpScore",
  "larkinScore",
  "myScore"
] as const;

export function addBottleDerivedFields<T extends Bottle>(bottle: T): T & BottleWithDrinkStatus {
  return {
    ...bottle,
    drinkStatus: getDrinkStatus(bottle.quantity, bottle.drinkingWindowStart, bottle.drinkingWindowEnd),
    drinkingWindow:
      bottle.drinkingWindowStart && bottle.drinkingWindowEnd
        ? `${bottle.drinkingWindowStart}-${bottle.drinkingWindowEnd}`
        : "No window"
  };
}

export function normalizeBottleInput(input: BottleInput) {
  const data: Record<string, unknown> = {
    producer: String(input.producer || "").trim(),
    wineName: String(input.wineName || "").trim(),
    type: safeChoice(input.type, WINE_TYPES, "Red"),
    bottleSize: safeChoice(input.bottleSize, BOTTLE_SIZES, "750ml"),
    status: safeChoice(input.status, BOTTLE_STATUSES, "In Cellar"),
    quantity: toInt(input.quantity, 0)
  };

  for (const field of nullableStringFields) {
    data[field] = toNullableString(input[field]);
  }

  for (const field of nullableNumberFields) {
    data[field] = toNullableNumber(input[field]);
  }

  data.purchaseDate = input.purchaseDate ? new Date(input.purchaseDate) : null;

  if (!data.producer) throw new Error("Producer is required.");
  if (!data.wineName) throw new Error("Wine name is required.");
  if (typeof data.quantity === "number" && data.quantity < 0) throw new Error("Quantity cannot be negative.");
  if (typeof data.personalRating === "number" && (data.personalRating < 1 || data.personalRating > 5)) {
    throw new Error("Personal rating must be between 1 and 5.");
  }

  return data;
}

function toNullableString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toInt(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.trunc(numeric) : fallback;
}

function safeChoice<T extends readonly string[]>(value: unknown, choices: T, fallback: T[number]) {
  const normalized = String(value ?? "").trim();
  return choices.includes(normalized as T[number]) ? normalized : fallback;
}
