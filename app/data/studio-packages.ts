export interface StudioPackage {
  id: "starter" | "pro" | "enterprise";
  name: string;
  price: number | null;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
}

export const studioPackages: StudioPackage[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9900,
    priceLabel: "£99",
    features: [
      "Up to 20 images",
      "2 states each (on/off)",
      "Delivered as ready-to-use files",
      "48-hour delivery",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 44900,
    priceLabel: "£449",
    highlighted: true,
    features: [
      "Up to 100 images",
      "3+ states per product",
      "Full website integration",
      "Requires access to your site code",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceLabel: "Get in touch",
    features: [
      "Ongoing product updates",
      "Unlimited images",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];
