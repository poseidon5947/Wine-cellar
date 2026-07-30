import type { Bottle } from "@prisma/client";
import { addBottleDerivedFields } from "@/lib/bottle";
import { WINE_TYPES } from "@/lib/constants";
import { getDrinkStatus } from "@/lib/drink-status";

export function buildCellarSummary(bottles: Bottle[], currentYear = new Date().getFullYear()) {
  const typeCounts = WINE_TYPES.map((type) => ({
    type,
    count: bottles.filter((bottle) => bottle.type === type).length
  }));

  const stockByType = WINE_TYPES.map((type) => ({
    type,
    count: bottles.filter((bottle) => bottle.type === type).reduce((sum, bottle) => sum + bottle.quantity, 0)
  }));

  const regionCounts = Object.entries(
    bottles.reduce<Record<string, number>>((acc, bottle) => {
      const region = bottle.region?.trim() || "Unspecified";
      acc[region] = (acc[region] || 0) + bottle.quantity;
      return acc;
    }, {})
  )
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const valueByType = WINE_TYPES.map((type) => ({
    type,
    value: Number(bottles
      .filter((bottle) => bottle.type === type)
      .reduce((sum, bottle) => sum + bottle.quantity * (bottle.purchasePrice || 0), 0)
      .toFixed(2))
  }));

  const spendByYear = Object.entries(
    bottles.reduce<Record<string, number>>((acc, bottle) => {
      if (!bottle.purchaseDate || !bottle.purchasePrice) return acc;
      const year = String(bottle.purchaseDate.getFullYear());
      acc[year] = (acc[year] || 0) + bottle.quantity * bottle.purchasePrice;
      return acc;
    }, {})
  )
    .map(([year, value]) => ({ year, value: Number(value.toFixed(2)) }))
    .sort((a, b) => a.year.localeCompare(b.year))
    .slice(-8);

  const totalBottles = bottles.reduce((sum, bottle) => sum + bottle.quantity, 0);
  const totalCellarValue = bottles.reduce((sum, bottle) => sum + bottle.quantity * (bottle.purchasePrice || 0), 0);
  const rows = bottles.map(addBottleDerivedFields);

  const ready = rows
    .filter((bottle) => ["Ready", "Drink now"].includes(getDrinkStatus(bottle.quantity, bottle.drinkingWindowStart, bottle.drinkingWindowEnd, currentYear)) && bottle.quantity > 0)
    .slice(0, 12);
  const nextYear = rows
    .filter((bottle) => bottle.drinkingWindowStart === currentYear + 1 && bottle.quantity > 0)
    .slice(0, 12);
  const restock = rows.filter((bottle) => bottle.quantity === 0).slice(0, 12);

  return {
    kpis: {
      distinctWines: bottles.length,
      totalBottles,
      totalCellarValue: Number(totalCellarValue.toFixed(2)),
      typeCounts,
      stockByType,
      regionCounts,
      valueByType,
      spendByYear
    },
    lists: { ready, nextYear, restock }
  };
}
