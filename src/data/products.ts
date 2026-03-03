export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageOff: string;
  imageOn: string;
}

function lampImages(slug: string) {
  return {
    imageOff: `/images/lamps/${slug}-off.png`,
    imageOn: `/images/lamps/${slug}-on.png`,
  };
}

export const products: Product[] = [
  {
    id: 1,
    name: "LJUSKRAFT",
    price: 49,
    description: "Table lamp with oak base and linen shade",
    ...lampImages("ljuskraft"),
  },
  {
    id: 2,
    name: "GLÖDLAMPA",
    price: 29,
    description: "Minimalist desk lamp with adjustable arm",
    ...lampImages("glödlampa"),
  },
  {
    id: 3,
    name: "SKYMNING",
    price: 79,
    description: "Floor lamp with dimmable warm glow",
    ...lampImages("skymning"),
  },
  {
    id: 4,
    name: "STRÅLANDE",
    price: 129,
    description: "Pendant lamp with brass finish",
    ...lampImages("strålande"),
  },
  {
    id: 5,
    name: "LYKTOR",
    price: 39,
    description: "Paper lantern-style table lamp",
    ...lampImages("lyktor"),
  },
  {
    id: 6,
    name: "DIMLJUS",
    price: 89,
    description: "Mushroom-shaped accent lamp in frosted glass",
    ...lampImages("dimljus"),
  },
  {
    id: 7,
    name: "KVÄLLSRO",
    price: 159,
    description: "Arc floor lamp with marble base",
    ...lampImages("kvällsro"),
  },
  {
    id: 8,
    name: "SOLNEDGÅNG",
    price: 69,
    description: "Sunset projection lamp with rotating shade",
    ...lampImages("solnedgång"),
  },
  {
    id: 9,
    name: "FLIMMER",
    price: 34,
    description: "Candle-style LED table lamp",
    ...lampImages("flimmer"),
  },
  {
    id: 10,
    name: "STJÄRNLJUS",
    price: 199,
    description: "Starlight chandelier with crystal drops",
    ...lampImages("stjärnljus"),
  },
  {
    id: 11,
    name: "MYSBELYSNING",
    price: 45,
    description: "Cozy bedside lamp with fabric shade",
    ...lampImages("mysbelysning"),
  },
  {
    id: 12,
    name: "TAKLAMPA",
    price: 109,
    description: "Geometric ceiling pendant in matte black",
    ...lampImages("taklampa"),
  },
  {
    id: 13,
    name: "VÄGGLJUS",
    price: 55,
    description: "Wall-mounted sconce with pivoting head",
    ...lampImages("väggljus"),
  },
  {
    id: 14,
    name: "NATTLAMPA",
    price: 24,
    description: "Soft-glow children's night light",
    ...lampImages("nattlampa"),
  },
  {
    id: 15,
    name: "ELDSTAD",
    price: 149,
    description: "Sculptural floor lamp in bent plywood",
    ...lampImages("eldstad"),
  },
  {
    id: 16,
    name: "MÅNLJUS",
    price: 99,
    description: "Moon-shaped hanging pendant in rice paper",
    ...lampImages("månljus"),
  },
];
