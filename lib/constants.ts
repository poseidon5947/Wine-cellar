export const WINE_TYPES = [
  "Red",
  "White",
  "Sparkling",
  "Rose",
  "Fortified",
  "Dessert",
  "Other"
] as const;

export const BOTTLE_SIZES = ["375ml", "500ml", "750ml", "1000ml", "1500ml", "3000ml"] as const;

export const BOTTLE_STATUSES = ["In Cellar", "Reserved", "Gifted", "Drunk", "Archived"] as const;

function range(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix} ${index + 1}`);
}

export const STORAGE_LOCATIONS = [
  ...range("Milk Crate", 15),
  ...range("Left Display", 12),
  ...range("Right Display", 18),
  ...range("Mike's Post Box", 18),
  ...range("Triangle", 24)
] as const;

export const COMMON_GRAPE_VARIETIES = [
  "Barbera",
  "Bordeaux Blend",
  "Burgundy Blend",
  "Cabernet Franc",
  "Cabernet Sauvignon",
  "Cabernet Sauvignon-Shiraz",
  "Chardonnay",
  "Chenin Blanc",
  "Gamay",
  "Gewurztraminer",
  "GSM",
  "Grenache",
  "Malbec",
  "Merlot",
  "Montepulciano",
  "Mourvedre",
  "Muscat",
  "Nebbiolo",
  "Petit Verdot",
  "Pinot Gris / Pinot Grigio",
  "Pinot Meunier",
  "Pinot Noir",
  "Pinot Noir, Chardonnay, Pinot Meunier",
  "Riesling",
  "Sangiovese",
  "Sauvignon Blanc",
  "Semillon",
  "Shiraz",
  "Shiraz-Cabernet Sauvignon",
  "Southern Rhone blend",
  "Syrah",
  "Tempranillo",
  "Viognier",
  "Zinfandel"
] as const;

export const GRAPE_PRIORITY_ORDER = [
  "Shiraz",
  "Cabernet Sauvignon",
  "Riesling",
  "Shiraz-Cabernet Sauvignon",
  "Cabernet Sauvignon-Shiraz",
  "Chardonnay",
  "Semillon",
  "Bordeaux Blend",
  "Burgundy Blend",
  "GSM"
] as const;

export function sortGrapeVarieties(values: string[]) {
  const priority = new Map(GRAPE_PRIORITY_ORDER.map((value, index) => [value.toLowerCase(), index]));
  return [...values].sort((a, b) => {
    const aIndex = priority.get(a.toLowerCase());
    const bIndex = priority.get(b.toLowerCase());
    if (aIndex !== undefined || bIndex !== undefined) {
      if (aIndex === undefined) return 1;
      if (bIndex === undefined) return -1;
      return aIndex - bIndex;
    }
    return a.localeCompare(b);
  });
}

export const COUNTRIES = [
  "Australia",
  "France",
  "Italy",
  "Spain",
  "United States",
  "New Zealand",
  "Germany",
  "Portugal",
  "South Africa",
  "Argentina",
  "Chile",
  "Other"
] as const;

export const SCORE_FIELDS = ["hookScore", "hallidayScore", "rpScore", "larkinScore", "myScore"] as const;

export const CATALOGUE_SORT_FIELDS = [
  "producer",
  "wineName",
  "vintage",
  "type",
  "quantity",
  "personalRating",
  "drinkingWindowStart",
  "drinkingWindowEnd",
  "hookScore",
  "hallidayScore",
  "rpScore",
  "larkinScore",
  "myScore",
  "updatedAt"
] as const;

export type WineType = (typeof WINE_TYPES)[number];
export type BottleSize = (typeof BOTTLE_SIZES)[number];
export type BottleStatus = (typeof BOTTLE_STATUSES)[number];
