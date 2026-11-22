import Link from 'next/link';
import { useEffect, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import OrderTotals from '@/components/orders/OrderTotals';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button, { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Container from '@/components/ui/Container';
import CoverImage from '@/components/ui/CoverImage';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import PageTitle from '@/components/ui/PageTitle';
import QuantityStepper from '@/components/ui/QuantityStepper';
import {
  getCartItems,
  groupByBrand,
  removeFromCart,
  setCartSelection,
  updateCartItem,
  useCart,
  type CartItem,
} from '@/hooks/useCart';
import { ApiError } from '@/lib/api';
import { getProductById } from '@/services/products';
import { formatMoney } from '@/utils/format';
import { toCartItem } from '@/utils/shop';

// Các món còn hàng (chọn được) trong một danh sách.
const selectable = (items: CartItem[]) => items.filter((item) => item.stock > 0);
const allSelected = (items: CartItem[]) =>
  selectable(items).length > 0 && selectable(items).every((item) => item.selected);
const ids = (items: CartItem[]) => items.map((item) => item.productId);

function CartItemRow({ item }: { item: CartItem }) {
  const isSoldOut = item.stock <= 0;

  return (
    <li className='flex gap-3 py-5 sm:gap-4'>
      <div className='pt-1'>
        <Checkbox
          aria-label={`Chọn ${item.title}`}
          checked={item.selected}
          disabled={isSoldOut}
          onChange={(event) => setCartSelection([item.productId], event.target.checked)}
        />
      </div>
      <CoverImage
        src={item.imageUrl}
        alt={`Ảnh ${item.title}`}
        sizes='96px'
        iconSize='sm'
        className='size-18 shrink-0 rounded-media sm:size-24'
      />
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <Link
              href={`/products/${item.slug}`}
              className='font-medium text-ink outline-none hover:underline focus-visible:underline'
            >
              {item.title}
            </Link>
            <p className='text-body-sm text-ink-muted'>
              {formatMoney(item.unitPrice, item.currency)} / {item.unit}
            </p>
          </div>
          <IconButton
            label={`Bỏ ${item.title} khỏi giỏ`}
            variant='ghost'
            size='sm'
            onClick={() => removeFromCart([item.productId])}
          >
            <Icon name='trash' className='size-4' />
          </IconButton>
        </div>

        {isSoldOut ? (
          <span>
            <Badge tone='neutral'>Hết hàng</Badge>
          </span>
        ) : (
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <QuantityStepper
              size='sm'
              label={item.title}
              value={item.quantity}
              max={item.stock}
              onChange={(quantity) => updateCartItem(item.productId, { quantity })}
            />
            <p className='font-semibold text-ink'>
              {formatMoney(item.unitPrice * item.quantity, item.currency)}
            </p>
          </div>
        )}

        {!isSoldOut && (
          <Input
            size='sm'
            aria-label={`Ghi chú cho ${item.title}`}
            placeholder='Ghi chú cho tiệm'
            maxLength={500}
            value={item.note ?? ''}
            onChange={(event) => updateCartItem(item.productId, { note: event.target.value })}
          />
        )}
      </div>
    </li>
  );
}

export default function CartPage() {
  const { items, selectedItems, selectedSubtotal } = useCart();
  const [removedTitles, setRemovedTitles] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);

  // Mở trang giỏ: tải lại giá, tồn kho, tiệm từ API; sản phẩm đã bị xoá thì bỏ khỏi giỏ.
  useEffect(() => {
    let isActive = true;
    // Đọc thẳng từ localStorage: lúc hydrate, `items` của lần render đầu vẫn là giỏ rỗng.
    const snapshot = getCartItems();

    void Promise.all(
      snapshot.map((item) =>
        getProductById(item.productId)
          .then(({ data }) => ({ item, product: data }))
          .catch((error) => ({
            item,
            product: null,
            missing: error instanceof ApiError && error.status === 404,
          })),
      ),
    ).then((results) => {
      if (!isActive) return;

      const missing = results.filter((result) => 'missing' in result && result.missing);
      for (const { item, product } of results) {
        if (product) {
          const { quantity, ...fresh } = toCartItem(product, item.quantity);
          // Hết hàng thì bỏ chọn để không lọt vào đơn
          updateCartItem(item.productId, {
            ...fresh,
            quantity,
            ...(fresh.stock <= 0 ? { selected: false } : {}),
          });
        }
      }
      removeFromCart(missing.map(({ item }) => item.productId));
      setRemovedTitles(missing.map(({ item }) => item.title));
      setIsRefreshing(false);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const groups = groupByBrand(items);
  const selectedCount = selectedItems.length;
  const currency = selectedItems[0]?.currency ?? items[0]?.currency ?? 'VND';

  return (
    <>
      <PageTitle title='Giỏ hàng' />

      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h1 font-semibold text-ink'>Giỏ hàng</h1>

        {removedTitles.length > 0 && (
          <Alert tone='warning' className='mt-6'>
            Đã bỏ khỏi giỏ vì sản phẩm không còn bán: {removedTitles.join(', ')}.
          </Alert>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon='cart'
            className='mt-8'
            title='Giỏ hàng đang trống'
            description='Ghé cửa hàng và chọn vài món bánh bạn thích nhé.'
            action={<ButtonLink href='/products'>Đến cửa hàng</ButtonLink>}
          />
        ) : (
          <div className='mt-8 flex flex-col gap-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <Checkbox
                label={`Chọn tất cả (${selectable(items).length})`}
                checked={allSelected(items)}
                disabled={selectable(items).length === 0}
                onChange={(event) => setCartSelection(ids(items), event.target.checked)}
              />
              {selectedCount > 0 && (
                <Button variant='ghost' size='sm' onClick={() => removeFromCart(ids(selectedItems))}>
                  <Icon name='trash' className='size-4' />
                  Xoá {selectedCount} món đã chọn
                </Button>
              )}
            </div>

            {groups.map((group) => (
              <section
                key={group.brandId ?? 'unknown'}
                aria-label={group.brandName ?? 'Tiệm khác'}
                className='rounded-panel bg-surface px-5 sm:px-6'
              >
                <div className='flex items-center gap-3 border-b border-line py-4'>
                  <Checkbox
                    aria-label={`Chọn tất cả món của ${group.brandName ?? 'tiệm này'}`}
                    checked={allSelected(group.items)}
                    disabled={selectable(group.items).length === 0}
                    onChange={(event) => setCartSelection(ids(group.items), event.target.checked)}
                  />
                  <Icon name='store' className='size-5 text-ink-muted' />
                  <h2 className='font-medium text-ink'>{group.brandName ?? 'Tiệm khác'}</h2>
                </div>
                <ul className='flex flex-col divide-y divide-line'>
                  {group.items.map((item) => (
                    <CartItemRow key={item.productId} item={item} />
                  ))}
                </ul>
              </section>
            ))}

            <OrderTotals
              subtotal={selectedSubtotal}
              deliveryFee={0}
              totalAmount={selectedSubtotal}
              currency={currency}
            />

            <div className='flex flex-wrap items-center justify-between gap-3'>
              <ButtonLink href='/products' variant='ghost'>
                <Icon name='chevron-left' className='size-4' />
                Tiếp tục mua sắm
              </ButtonLink>
              {selectedCount === 0 || isRefreshing ? (
                <Button size='lg' disabled className='uppercase'>
                  {isRefreshing ? 'Đang cập nhật giá...' : 'Chọn món để đặt hàng'}
                </Button>
              ) : (
                <ButtonLink href='/checkout' size='lg' className='uppercase'>
                  Đặt hàng ({selectedCount})
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

CartPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
