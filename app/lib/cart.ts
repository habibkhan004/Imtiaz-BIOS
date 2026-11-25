export type CartItem = {
  fileId: string;
  name: string;
  model: string;
  brand: string;
  type: string;
  price: number;
  description?: string;
};

export const CART_KEY = "imtiaz-cart";
export const CART_EVENT = "imtiaz-cart-change";

function cartStorageKey(userId?: string | null) {
  return userId ? `${CART_KEY}:${userId}` : `${CART_KEY}:guest`;
}

export function readCart(userId?: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.fileId === "string" && typeof i.price === "number",
    );
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[], userId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(userId), JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(item: CartItem, userId?: string | null): { ok: boolean; reason?: string } {
  const items = readCart(userId);
  if (items.some((i) => i.fileId === item.fileId)) {
    return { ok: false, reason: "Already in cart" };
  }
  writeCart([...items, item], userId);
  return { ok: true };
}

export function removeFromCart(fileId: string, userId?: string | null) {
  writeCart(
    readCart(userId).filter((i) => i.fileId !== fileId),
    userId,
  );
}

export function clearCartItems(fileIds: string[], userId?: string | null) {
  const set = new Set(fileIds);
  writeCart(
    readCart(userId).filter((i) => !set.has(i.fileId)),
    userId,
  );
}

export function clearCart(userId?: string | null) {
  writeCart([], userId);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
}

export function cartCount(userId?: string | null) {
  return readCart(userId).length;
}
