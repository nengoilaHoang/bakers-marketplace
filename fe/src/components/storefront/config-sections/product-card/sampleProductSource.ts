import type { Product } from '@/types/product';

export const SAMPLE_PRODUCT_SOURCE: { product: Product } = {
  product: {
    id: 'sample-product-id',
    brandId: 'sample-brand-id',
    vendorId: 'sample-vendor-id',
    title: 'Artisan Croissant',
    description: 'Flaky, golden butter croissant baked fresh every morning.',
    slug: 'artisan-croissant',
    unitPrice: 45000,
    unitCost: 22000,
    currency: 'VND',
    unit: 'piece',
    expirationDate: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    media: [
      {
        id: 'sample-image-id',
        displayName: 'Artisan Croissant',
        originalName: 'croissant.jpg',
        url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
        contentType: 'image/jpeg',
        extName: 'jpg',
        size: 102400,
        checksum: null,
        uploadedAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        width: 800,
        height: 800,
      },
    ],
    notes: [],
    tags: [
      {
        id: 'sample-tag-id',
        productId: 'sample-product-id',
        name: 'Pastry',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    stock: {
      id: 'sample-stock-id',
      stock: 24,
      createdAt: '2026-01-01T00:00:00.000Z',
      alerts: [],
    },
    collections: [
      {
        id: 'sample-collection-id',
        name: 'Morning Pastries',
        slug: 'morning-pastries',
        isActive: true,
      },
    ],
  },
};
