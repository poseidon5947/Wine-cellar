import { Prisma } from "@prisma/client";
import { CATALOGUE_SORT_FIELDS, SCORE_FIELDS } from "@/lib/constants";

export function buildBottleWhere(searchParams: URLSearchParams): Prisma.BottleWhereInput {
  const and: Prisma.BottleWhereInput[] = [];
  const search = searchParams.get("search")?.trim();

  if (search) {
    and.push({
      OR: [
        { producer: { contains: search } },
        { wineName: { contains: search } },
        { notes: { contains: search } },
        { myNotes: { contains: search } }
      ]
    });
  }

  addContains(and, "producer", searchParams.get("producer"));
  addContains(and, "grapes", searchParams.get("grape"));
  addContains(and, "region", searchParams.get("region"));
  addEquals(and, "vintage", searchParams.get("vintage"));
  addEquals(and, "type", searchParams.get("type"));
  addNumberFilter(and, "personalRating", searchParams.get("rating"));
  addNumberFilter(and, "quantity", searchParams.get("quantity"));
  addNumberFilter(and, "drinkingWindowStart", searchParams.get("windowStart"));
  addNumberFilter(and, "drinkingWindowEnd", searchParams.get("windowEnd"));
  addContains(and, "others", searchParams.get("others"));

  for (const field of SCORE_FIELDS) {
    addNumberFilter(and, field, searchParams.get(field));
  }

  return and.length ? { AND: and } : {};
}

export function safeBottleSort(value: string | null) {
  return CATALOGUE_SORT_FIELDS.includes(value as (typeof CATALOGUE_SORT_FIELDS)[number]) ? value! : "updatedAt";
}

function addContains(and: Prisma.BottleWhereInput[], field: keyof Prisma.BottleWhereInput, value: string | null) {
  const normalized = value?.trim();
  if (normalized) and.push({ [field]: { contains: normalized } });
}

function addEquals(and: Prisma.BottleWhereInput[], field: keyof Prisma.BottleWhereInput, value: string | null) {
  const normalized = value?.trim();
  if (normalized) and.push({ [field]: normalized });
}

function addNumberFilter(and: Prisma.BottleWhereInput[], field: keyof Prisma.BottleWhereInput, value: string | null) {
  if (!value) return;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) and.push({ [field]: numeric });
}
