function key(
  category: "lamp" | "fireplace" | "hero",
  productId: number,
  state: "off" | "on",
): string {
  return `${category}-image-${productId}-${state}`;
}

export function saveImage(
  category: "lamp" | "fireplace" | "hero",
  productId: number,
  state: "off" | "on",
  dataUri: string,
): void {
  localStorage.setItem(key(category, productId, state), dataUri);
}

export function loadImage(
  category: "lamp" | "fireplace" | "hero",
  productId: number,
  state: "off" | "on",
): string | null {
  return localStorage.getItem(key(category, productId, state));
}

export function hasImages(category: "lamp" | "fireplace" | "hero", productId: number): boolean {
  return !!(
    localStorage.getItem(key(category, productId, "off")) &&
    localStorage.getItem(key(category, productId, "on"))
  );
}
