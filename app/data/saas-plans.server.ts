const priceIdMap: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_SAAS_PRO,
  business: process.env.STRIPE_PRICE_SAAS_BUSINESS,
};

export function getSaasPriceId(planId: string): string {
  const priceId = priceIdMap[planId];
  if (!priceId) throw new Error(`Missing STRIPE_PRICE_SAAS_${planId.toUpperCase()} env var`);
  return priceId;
}
