import { useSyncExternalStore } from 'react';

// Giỏ hàng lưu ở trình duyệt (localStorage), chưa có bảng trên server.
// Giá, tên, ảnh lưu kèm chỉ để hiển thị nhanh; trang giỏ hàng tải lại từ API,
// còn lúc đặt hàng BE tự lấy giá từ DB.
export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  unitPrice: number;
  currency: string;
  unit: string;
  imageUrl: string | null;
  // Tiệm bán sản phẩm: giỏ hàng gom các món cùng tiệm vào một ô.
  brandId: string | null;
  brandName: string | null;
  // Tồn kho lúc thêm vào giỏ, dùng làm mức tối đa của ô số lượng.
  stock: number;
  quantity: number;
  note?: string;
  // Được tick để đặt hàng; chỉ các món được chọn mới vào đơn.
  selected: boolean;
};

// Dữ liệu sản phẩm khi thêm vào giỏ: trạng thái chọn do giỏ tự quản lý.
export type CartItemInput = Omit<CartItem, 'selected'>;

export type CartGroup = {
  brandId: string | null;
  brandName: string | null;
  items: CartItem[];
};

const STORAGE_KEY = 'bakers-cart';
const EMPTY: CartItem[] = [];

let cached: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cached) return cached;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    // Giỏ lưu từ bản cũ chưa có tiệm và trạng thái chọn: điền mặc định.
    cached = Array.isArray(parsed)
      ? (parsed as Partial<CartItem>[]).map((item) => ({
          brandId: null,
          brandName: null,
          ...item,
          selected: item.selected ?? true,
        })) as CartItem[]
      : [];
  } catch {
    cached = [];
  }

  return cached;
}

function write(items: CartItem[]) {
  cached = items;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Trình duyệt chặn lưu trữ: giỏ vẫn dùng được trong phiên hiện tại.
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Đồng bộ khi giỏ đổi ở tab khác.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function clampQuantity(quantity: number, stock: number) {
  return Math.max(1, Math.min(Math.floor(quantity), Math.max(stock, 1)));
}

/** Thêm sản phẩm (được chọn sẵn); đã có trong giỏ thì cộng dồn số lượng (không vượt tồn kho). */
export function addToCart(item: CartItemInput) {
  const items = read();
  const existing = items.find((entry) => entry.productId === item.productId);

  write(
    existing
      ? items.map((entry) =>
          entry.productId === item.productId
            ? {
                ...entry,
                ...item,
                selected: true,
                quantity: clampQuantity(entry.quantity + item.quantity, item.stock),
              }
            : entry,
        )
      : [...items, { ...item, selected: true, quantity: clampQuantity(item.quantity, item.stock) }],
  );
}

export function updateCartItem(productId: string, changes: Partial<Omit<CartItem, 'productId'>>) {
  write(
    read().map((entry) => {
      if (entry.productId !== productId) return entry;
      const next = { ...entry, ...changes };
      return { ...next, quantity: clampQuantity(next.quantity, next.stock) };
    }),
  );
}

/** Tick / bỏ tick một hoặc nhiều món (cả tiệm, cả giỏ). Món hết hàng không chọn được. */
export function setCartSelection(productIds: string[], selected: boolean) {
  write(
    read().map((entry) =>
      productIds.includes(entry.productId)
        ? { ...entry, selected: selected && entry.stock > 0 }
        : entry,
    ),
  );
}

/** Chỉ chọn các món này, bỏ chọn phần còn lại (Mua ngay, Đặt lại). */
export function selectOnly(productIds: string[]) {
  write(
    read().map((entry) => ({
      ...entry,
      selected: productIds.includes(entry.productId) && entry.stock > 0,
    })),
  );
}

export function removeFromCart(productIds: string[]) {
  write(read().filter((entry) => !productIds.includes(entry.productId)));
}

/** Đọc giỏ ngay lúc gọi (dùng trong effect, khi giá trị của lần render có thể chưa kịp cập nhật). */
export function getCartItems(): CartItem[] {
  return read();
}

/** Gom các món theo tiệm, giữ thứ tự tiệm theo món được thêm trước. */
export function groupByBrand(items: CartItem[]): CartGroup[] {
  const groups = new Map<string, CartGroup>();

  for (const item of items) {
    const key = item.brandId ?? '';
    const group = groups.get(key) ?? { brandId: item.brandId, brandName: item.brandName, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }

  return [...groups.values()];
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const selectedItems = items.filter((item) => item.selected);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return { items, count, selectedItems, selectedSubtotal };
}
