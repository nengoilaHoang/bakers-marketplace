import type { CartItemInput } from '@/hooks/useCart';
import type { Product } from '@/types/product';

// Ảnh đầu tiên của sản phẩm (đã sắp theo thứ tự hiển thị), không có thì null.
export function productImageUrl(product: Product): string | null {
  return product.media[0]?.url ?? null;
}

// Tồn kho hiện tại; sản phẩm chưa từng được nhập kho coi như 0.
export function productStock(product: Product): number {
  return product.stock?.stock ?? 0;
}

export function toCartItem(product: Product, quantity: number): CartItemInput {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    unitPrice: product.unitPrice,
    currency: product.currency,
    unit: product.unit,
    imageUrl: productImageUrl(product),
    brandId: product.brand?.id ?? product.brandId,
    brandName: product.brand?.name ?? null,
    stock: productStock(product),
    quantity,
  };
}
