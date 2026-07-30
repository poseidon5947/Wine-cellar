import { Prisma } from "@prisma/client";

export function buildHistoryWhere(searchParams: URLSearchParams): Prisma.ConsumptionLogWhereInput {
  const date: Prisma.DateTimeFilter = {};
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));

  if (from) date.gte = from;
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    date.lte = endOfDay;
  }

  return Object.keys(date).length ? { date } : {};
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
