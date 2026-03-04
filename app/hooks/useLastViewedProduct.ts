const KEY = "vt-last-product";

export function setLastViewedProduct(id: number): void {
  try {
    sessionStorage.setItem(KEY, String(id));
  } catch {}
}

export function getLastViewedProduct(): number | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v !== null ? Number(v) : null;
  } catch {
    return null;
  }
}

export function clearLastViewedProduct(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
