import type { Product } from "./products";

function fireplaceImages(slug: string) {
  return {
    imageOff: `/images/fireplaces/webp/${slug}-off.webp`,
    imageOn: `/images/fireplaces/webp/${slug}-on.webp`,
    thumbOff: `/images/fireplaces/thumbs/${slug}-off.webp`,
    thumbOn: `/images/fireplaces/thumbs/${slug}-on.webp`,
  };
}

export const fireplaces: Product[] = [
  {
    id: 101,
    name: "ELDVARM",
    price: 349,
    description: "Built-in stone fireplace with oak mantel",
    ...fireplaceImages("eldvarm"),
  },
  {
    id: 102,
    name: "BRASVARM",
    price: 599,
    description: "Freestanding cast iron wood stove",
    ...fireplaceImages("brasvarm"),
  },
  {
    id: 103,
    name: "VINTERHYGGE",
    price: 449,
    description: "Corner fireplace with slate surround",
    ...fireplaceImages("vinterhygge"),
  },
  {
    id: 104,
    name: "FLAMMSKOG",
    price: 279,
    description: "Wall-mounted ethanol fireplace in brushed steel",
    ...fireplaceImages("flammskog"),
  },
  {
    id: 105,
    name: "GLÖDELD",
    price: 699,
    description: "Double-sided glass fireplace",
    ...fireplaceImages("glödeld"),
  },
  {
    id: 106,
    name: "STUGLIV",
    price: 389,
    description: "Rustic brick fireplace with iron grate",
    ...fireplaceImages("stugliv"),
  },
  {
    id: 107,
    name: "NORRSKEN",
    price: 529,
    description: "Minimalist linear gas fireplace",
    ...fireplaceImages("norrsken"),
  },
  {
    id: 108,
    name: "ELDSTORM",
    price: 249,
    description: "Tabletop concrete fire bowl",
    ...fireplaceImages("eldstorm"),
  },
  {
    id: 109,
    name: "VINTERELD",
    price: 459,
    description: "Traditional tiled corner fireplace",
    ...fireplaceImages("vintereld"),
  },
  {
    id: 110,
    name: "LÅGANDE",
    price: 319,
    description: "Suspended hanging fireplace in matte black",
    ...fireplaceImages("lågande"),
  },
  {
    id: 111,
    name: "BRASKAMIN",
    price: 789,
    description: "Grand marble fireplace with ornate mantel",
    ...fireplaceImages("braskamin"),
  },
  {
    id: 112,
    name: "HEMMAVARM",
    price: 429,
    description: "Inset wood-burning stove with glass door",
    ...fireplaceImages("hemmavarm"),
  },
  {
    id: 113,
    name: "KAMINELD",
    price: 299,
    description: "Slim column bioethanol fireplace",
    ...fireplaceImages("kamineld"),
  },
  {
    id: 114,
    name: "ELDHAMN",
    price: 549,
    description: "Stone hearth fireplace with built-in seating",
    ...fireplaceImages("eldhamn"),
  },
  {
    id: 115,
    name: "GNISTSPEL",
    price: 369,
    description: "Art deco fireplace with brass fender",
    ...fireplaceImages("gnistspel"),
  },
  {
    id: 116,
    name: "DRAKHETTA",
    price: 649,
    description: "Floor-to-ceiling chimney fireplace in concrete",
    ...fireplaceImages("drakhetta"),
  },
];
