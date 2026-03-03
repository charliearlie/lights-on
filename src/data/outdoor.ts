import type { Product } from "./products";

function outdoorImages(slug: string) {
  return {
    imageOff: `/images/outdoor/${slug}-off.png`,
    imageOn: `/images/outdoor/${slug}-on.png`,
  };
}

export const outdoor: Product[] = [
  {
    id: 201,
    name: "GATLYKTOR",
    price: 349,
    description: "Victorian cast-iron lamp post with glass lantern",
    ...outdoorImages("gatlyktor"),
  },
  {
    id: 202,
    name: "STIGFOT",
    price: 129,
    description: "Modern cylindrical bollard light in brushed steel",
    ...outdoorImages("stigfot"),
  },
  {
    id: 203,
    name: "VAGNLJUS",
    price: 189,
    description: "Wall-mounted copper coach lantern",
    ...outdoorImages("vagnljus"),
  },
  {
    id: 204,
    name: "SOLSTIG",
    price: 49,
    description: "Solar-powered path stake light in matte black",
    ...outdoorImages("solstig"),
  },
  {
    id: 205,
    name: "GRINDPELARE",
    price: 279,
    description: "Stone pillar gate post light with frosted globe",
    ...outdoorImages("grindpelare"),
  },
  {
    id: 206,
    name: "FESTRAD",
    price: 79,
    description: "Hanging festoon string lights with Edison bulbs",
    ...outdoorImages("festrad"),
  },
  {
    id: 207,
    name: "VÄGGFLÖDE",
    price: 199,
    description: "Architectural LED wall washer in dark bronze",
    ...outdoorImages("väggflöde"),
  },
  {
    id: 208,
    name: "NORDVÄG",
    price: 429,
    description: "Contemporary curved street lamp in gunmetal",
    ...outdoorImages("nordväg"),
  },
  {
    id: 209,
    name: "TRÄDGLANS",
    price: 159,
    description: "Garden tree-mounted spotlight in weathered brass",
    ...outdoorImages("trädglans"),
  },
  {
    id: 210,
    name: "BRYGGLJUS",
    price: 219,
    description: "Wooden dock post lantern with nautical rope detail",
    ...outdoorImages("bryggljus"),
  },
  {
    id: 211,
    name: "ALLÉSKEN",
    price: 299,
    description: "Double-headed pathway lamp in verdigris copper",
    ...outdoorImages("allésken"),
  },
  {
    id: 212,
    name: "STENMUR",
    price: 89,
    description: "Recessed stone wall step light",
    ...outdoorImages("stenmur"),
  },
  {
    id: 213,
    name: "TRÄDÄCK",
    price: 69,
    description: "Flush-mount teak deck light with amber lens",
    ...outdoorImages("trädäck"),
  },
  {
    id: 214,
    name: "HAMNSKEN",
    price: 169,
    description: "Harbor-style pendant lamp with galvanized finish",
    ...outdoorImages("hamnsken"),
  },
  {
    id: 215,
    name: "VINTERGATA",
    price: 319,
    description: "Spiral decorative pole light with star cutouts",
    ...outdoorImages("vintergata"),
  },
  {
    id: 216,
    name: "KOPPARKUNG",
    price: 499,
    description: "Grand copper boulevard lamp with ornate bracket",
    ...outdoorImages("kopparkung"),
  },
];
