export interface SaasPlan {
  id: "free" | "pro" | "business";
  name: string;
  priceLabel: string;
  transformationsLimit: number;
  features: string[];
  highlighted?: boolean;
}

export const saasPlans: SaasPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "Free",
    transformationsLimit: 5,
    features: [
      "5 transforms/month",
      "Unlimited projects",
      "All transition types",
      "Public embeds",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "£29/mo",
    transformationsLimit: 100,
    highlighted: true,
    features: [
      "100 transforms/month",
      "Unlimited projects",
      "All transition types",
      "Custom embed styling",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "£79/mo",
    transformationsLimit: 500,
    features: [
      "500 transforms/month",
      "Unlimited projects",
      "All transition types",
      "Priority support",
    ],
  },
];
