export type CriticScoreLookupResult = Partial<{
  hallidayScore: number;
  hookScore: number;
  rpScore: number;
  larkinScore: number;
  myScore: number;
  others: string;
  notes: string;
}>;

export async function lookupCriticScores(
  producer: string,
  wineName: string,
  vintage: string
): Promise<CriticScoreLookupResult | null> {
  const apiKey = process.env.CRITIC_LOOKUP_API_KEY;
  if (!apiKey) return null;

  // Real provider contract expected here:
  // POST producer, wineName, and vintage to a licensed wine-score provider using
  // CRITIC_LOOKUP_API_KEY, then normalize its JSON response into the optional
  // fields in CriticScoreLookupResult. Unknown or missing scores should be omitted
  // rather than returned as zero/null so the form can avoid overwriting user data.
  void producer;
  void wineName;
  void vintage;

  return null;
}
