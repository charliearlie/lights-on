import { studioPackages, type StudioPackage } from "./studio-packages";

export function getPackageWithPriceId(
  packageId: string,
): StudioPackage & { resolvedPriceId: string } {
  const pkg = studioPackages.find((p) => p.id === packageId);
  if (!pkg) throw new Error(`Unknown package: ${packageId}`);
  if (pkg.id === "enterprise")
    throw new Error("Enterprise requires contact flow");

  const priceIdMap: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
  };

  const resolvedPriceId = priceIdMap[pkg.id];
  if (!resolvedPriceId)
    throw new Error(
      `Missing STRIPE_PRICE_${pkg.id.toUpperCase()} environment variable`,
    );

  return { ...pkg, resolvedPriceId };
}
