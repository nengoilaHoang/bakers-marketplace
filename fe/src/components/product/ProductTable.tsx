import Link from 'next/link';

import StockStatusBadge from '@/components/stock/StockStatusBadge';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import IconButton, { IconLink } from '@/components/ui/IconButton';
import Table, { Td, Th } from '@/components/ui/Table';
import type { Product } from '@/types/product';
import { formatMoney } from '@/utils/format';
import { getStockStatus } from '@/utils/stockStatus';

type ProductTableProps = Readonly<{
  products: Product[];
  // Có onDelete thì hiện cột thao tác (sửa / xoá).
  onDelete?: (product: Product) => void;
  deletingId?: string | null;
}>;

// Bảng sản phẩm của vendor: tên, giá, tồn kho, tag, bộ sưu tập.
export default function ProductTable({ products, onDelete, deletingId }: ProductTableProps) {
  return (
    <Table caption='Danh sách sản phẩm'>
      <thead>
        <tr>
          <Th>Sản phẩm</Th>
          <Th align='right'>Giá bán</Th>
          <Th align='right'>Giá vốn</Th>
          <Th align='right'>Tồn kho</Th>
          <Th>Tag</Th>
          <Th>Bộ sưu tập</Th>
          {onDelete && (
            <Th>
              <span className='sr-only'>Thao tác</span>
            </Th>
          )}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const stock = product.stock?.stock ?? 0;
          const status = getStockStatus(stock, product.stock?.alerts ?? []);

          return (
            <tr key={product.id} className='hover:bg-surface-soft/60'>
              <Td className='min-w-56'>
                <Link
                  href={`/vendors/products/${product.id}`}
                  className='font-medium text-ink hover:underline'
                >
                  {product.title}
                </Link>
                <p className='text-caption text-ink-muted'>
                  {product.slug} · {product.unit}
                </p>
              </Td>
              <Td align='right' className='whitespace-nowrap'>
                {formatMoney(product.unitPrice, product.currency)}
              </Td>
              <Td align='right' className='whitespace-nowrap text-ink-muted'>
                {formatMoney(product.unitCost, product.currency)}
              </Td>
              <Td align='right'>
                <div className='flex flex-col items-end gap-1'>
                  <span className='font-semibold whitespace-nowrap'>
                    {stock} <span className='font-normal text-ink-muted'>{product.unit}</span>
                  </span>
                  <StockStatusBadge status={status} />
                </div>
              </Td>
              <Td>
                {product.tags.length === 0 ? (
                  <span className='text-ink-subtle'>—</span>
                ) : (
                  <div className='flex flex-wrap gap-1'>
                    {product.tags.map((tag) => (
                      <Badge key={tag.id} tone='neutral'>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Td>
              <Td className='text-ink-muted'>
                {product.collections.map((collection) => collection.name).join(', ') || (
                  <span className='text-ink-subtle'>—</span>
                )}
              </Td>
              {onDelete && (
                <Td align='right'>
                  <div className='flex justify-end gap-1'>
                    <IconLink
                      href={`/vendors/products/${product.id}/edit`}
                      label={`Sửa ${product.title}`}
                      variant='ghost'
                      size='sm'
                    >
                      <Icon name='edit' className='size-4' />
                    </IconLink>
                    <IconButton
                      label={`Xoá ${product.title}`}
                      variant='ghost'
                      size='sm'
                      disabled={deletingId === product.id}
                      onClick={() => onDelete(product)}
                    >
                      <Icon name='trash' className='size-4 text-danger' />
                    </IconButton>
                  </div>
                </Td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
