const KEY_PREFIX = "lamp-image-";

function key(productId: number, state: "off" | "on"): string {
  return `${KEY_PREFIX}${productId}-${state}`;
}

export function saveImage(
  productId: number,
  state: "off" | "on",
  dataUri: string,
): void {
  localStorage.setItem(key(productId, state), dataUri);
}

export function loadImage(
  productId: number,
  state: "off" | "on",
): string | null {
  return localStorage.getItem(key(productId, state));
}

export function hasImages(productId: number): boolean {
  return !!(
    localStorage.getItem(key(productId, "off")) &&
    localStorage.getItem(key(productId, "on"))
  );
}
