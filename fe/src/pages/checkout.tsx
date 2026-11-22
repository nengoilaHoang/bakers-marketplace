import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import OrderTotals from '@/components/orders/OrderTotals';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import Input, { Textarea } from '@/components/ui/Input';
import PageTitle from '@/components/ui/PageTitle';
import Select from '@/components/ui/Select';
import { groupByBrand, removeFromCart, useCart, type CartItem } from '@/hooks/useCart';
import useAuth from '@/hooks/user/useAuthContext';
import { ApiError } from '@/lib/api';
import { placeOrder, type ShippingAddress } from '@/services/orders';
import { formatMoney } from '@/utils/format';
import { loadWards, VN_PROVINCES, type VnWard } from '@/utils/vnAddress';

// Địa chỉ lần đặt trước, để điền sẵn lần sau (chỉ lưu trên trình duyệt này).
const ADDRESS_STORAGE_KEY = 'bakers-shipping-address';
const PHONE_PATTERN = /^(0|\+84)\d{9,10}$/;

type AddressField = keyof ShippingAddress;
type FieldErrors = Partial<Record<AddressField, string>>;

// Ô nhập tay; tỉnh và phường chọn từ danh sách (không cho gõ tay).
const TEXT_FIELDS: { name: 'recipientName' | 'phone' | 'streetAddress'; label: string; placeholder: string }[] = [
  { name: 'recipientName', label: 'Người nhận', placeholder: 'Họ và tên' },
  { name: 'phone', label: 'Số điện thoại', placeholder: 'Ví dụ: 0901234567' },
  { name: 'streetAddress', label: 'Địa chỉ', placeholder: 'Số nhà, tên đường' },
];

function loadSavedAddress(fallbackName: string): ShippingAddress {
  const empty = { recipientName: fallbackName, phone: '', streetAddress: '', ward: '', province: '' };

  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    const saved = raw ? { ...empty, ...(JSON.parse(raw) as ShippingAddress), note: '' } : empty;
    // Địa chỉ lưu từ trước (có thể gõ tay) không khớp danh sách tỉnh thì bỏ tỉnh và phường.
    return VN_PROVINCES.some((province) => province.name === saved.province)
      ? saved
      : { ...saved, province: '', ward: '' };
  } catch {
    return empty;
  }
}

function validate(address: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of TEXT_FIELDS) {
    if (!address[field.name].trim()) errors[field.name] = `Vui lòng nhập ${field.label.toLowerCase()}.`;
  }
  if (!address.province) errors.province = 'Vui lòng chọn tỉnh / thành phố.';
  if (!address.ward) errors.ward = 'Vui lòng chọn phường / xã.';
  if (address.phone.trim() && !PHONE_PATTERN.test(address.phone.trim())) {
    errors.phone = 'Số điện thoại gồm 10–11 chữ số, bắt đầu bằng 0 hoặc +84.';
  }

  return errors;
}

function getOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'INSUFFICIENT_STOCK') {
      return 'Một số món không còn đủ hàng. Hãy quay lại giỏ hàng để cập nhật số lượng.';
    }
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return 'Một số món đã ngừng bán. Hãy quay lại giỏ hàng để cập nhật.';
    }
    if (error.status === 403) return 'Tài khoản này không thể đặt hàng.';
  }

  return 'Không thể đặt hàng lúc này. Vui lòng thử lại.';
}

// Chỉ dựng khi giỏ có món được chọn (tức là đã ở trình duyệt), nên đọc localStorage lúc khởi tạo được.
// `items` là các món được tick trong giỏ; món không chọn vẫn nằm lại trong giỏ.
function CheckoutForm({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const router = useRouter();
  const { account } = useAuth();
  const [address, setAddress] = useState<ShippingAddress>(() => loadSavedAddress(''));
  // Phiên đăng nhập có thể tải xong sau form: chưa nhập tên người nhận thì lấy tên tài khoản.
  const [isNameEdited, setIsNameEdited] = useState(false);
  const recipientName =
    isNameEdited || address.recipientName ? address.recipientName : (account?.displayName ?? '');
  const [wards, setWards] = useState<VnWard[] | null>(null);

  useEffect(() => {
    let isActive = true;
    void loadWards().then((list) => {
      if (isActive) setWards(list);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const provinceCode = VN_PROVINCES.find((province) => province.name === address.province)?.code;
  const wardOptions = wards?.filter((ward) => ward.provinceCode === provinceCode) ?? [];
  // Phường đã lưu không thuộc tỉnh đang chọn thì coi như chưa chọn.
  const ward = wardOptions.some((option) => option.name === address.ward) ? address.ward : '';
  const values = { ...address, recipientName, ward };
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canOrder = !account || account.role === 'CUSTOMER' || account.role === 'BAKER';
  const currency = items[0]?.currency ?? 'VND';

  function setField(name: AddressField, value: string) {
    if (name === 'recipientName') setIsNameEdited(true);
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const shippingAddress: ShippingAddress = {
      recipientName: values.recipientName.trim(),
      phone: values.phone.trim(),
      streetAddress: values.streetAddress.trim(),
      ward: values.ward.trim(),
      province: values.province.trim(),
      ...(values.note?.trim() ? { note: values.note.trim() } : {}),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = await placeOrder({
        shippingAddress,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.note?.trim() ? { note: item.note.trim() } : {}),
        })),
      });

      try {
        // Ghi chú chỉ dành cho đơn này, không lưu để điền sẵn.
        window.localStorage.setItem(
          ADDRESS_STORAGE_KEY,
          JSON.stringify({ ...shippingAddress, note: undefined }),
        );
      } catch {
        // Không lưu được thì lần sau nhập lại, không ảnh hưởng đơn vừa đặt.
      }

      // Chuyển trang trước rồi mới bỏ các món đã đặt khỏi giỏ, để không loé lên trạng thái "giỏ trống".
      await router.replace(`/orders/${data.id}?placed=1`);
      removeFromCart(items.map((item) => item.productId));
    } catch (error) {
      setSubmitError(getOrderErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  function renderTextField(field: (typeof TEXT_FIELDS)[number]) {
    return (
      <Field
        key={field.name}
        label={field.label}
        htmlFor={`checkout-${field.name}`}
        required
        size='sm'
        error={errors[field.name]}
        className={field.name === 'streetAddress' ? 'sm:col-span-2' : undefined}
      >
        <Input
          id={`checkout-${field.name}`}
          value={values[field.name]}
          placeholder={field.placeholder}
          maxLength={field.name === 'phone' ? 15 : field.name === 'streetAddress' ? 500 : 255}
          inputMode={field.name === 'phone' ? 'tel' : undefined}
          autoComplete={field.name === 'recipientName' ? 'name' : field.name === 'phone' ? 'tel' : undefined}
          aria-invalid={Boolean(errors[field.name])}
          onChange={(event) => setField(field.name, event.target.value)}
        />
      </Field>
    );
  }

  if (!canOrder) {
    return (
      <Alert tone='info' className='mt-8'>
        Tài khoản cửa hàng và quản trị viên không đặt hàng được. Hãy dùng tài khoản khách hàng.
      </Alert>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className='mt-8 grid items-start gap-8 lg:grid-cols-3'>
      <div className='flex flex-col gap-5 rounded-panel bg-surface px-5 py-6 sm:px-8 lg:col-span-2'>
        <h2 className='text-h4 font-semibold text-ink'>Địa chỉ giao hàng</h2>
        <div className='grid gap-5 sm:grid-cols-2'>
          {TEXT_FIELDS.slice(0, 2).map(renderTextField)}
          <Field
            label='Tỉnh / thành phố'
            htmlFor='checkout-province'
            required
            size='sm'
            error={errors.province}
          >
            <Select
              id='checkout-province'
              tone='field'
              wrapperClassName='w-full'
              value={values.province}
              aria-invalid={Boolean(errors.province)}
              onChange={(event) => {
                // Đổi tỉnh thì chọn lại phường
                setField('province', event.target.value);
                setField('ward', '');
              }}
            >
              <option value=''>Chọn tỉnh / thành phố</option>
              {VN_PROVINCES.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label='Phường / xã'
            htmlFor='checkout-ward'
            required
            size='sm'
            error={errors.ward}
          >
            <Select
              id='checkout-ward'
              tone='field'
              wrapperClassName='w-full'
              value={values.ward}
              disabled={!provinceCode || !wards}
              aria-invalid={Boolean(errors.ward)}
              onChange={(event) => setField('ward', event.target.value)}
            >
              <option value=''>
                {!provinceCode
                  ? 'Chọn tỉnh / thành phố trước'
                  : !wards
                    ? 'Đang tải danh sách...'
                    : 'Chọn phường / xã'}
              </option>
              {wardOptions.map((option) => (
                <option key={option.code} value={option.name}>
                  {option.name}
                </option>
              ))}
            </Select>
          </Field>
          {renderTextField(TEXT_FIELDS[2])}
          <Field label='Ghi chú giao hàng' htmlFor='checkout-note' size='sm' className='sm:col-span-2'>
            <Textarea
              id='checkout-note'
              rows={3}
              maxLength={500}
              placeholder='Ví dụ: giao giờ hành chính, gọi trước khi đến'
              value={address.note ?? ''}
              onChange={(event) => setField('note', event.target.value)}
            />
          </Field>
        </div>
      </div>

      <aside className='flex flex-col gap-4'>
        <h2 className='text-h4 font-semibold text-ink'>Đơn hàng ({items.length} món)</h2>
        {groupByBrand(items).map((group) => (
          <div key={group.brandId ?? 'unknown'} className='flex flex-col gap-2 text-body-sm'>
            <h3 className='flex items-center gap-2 text-meta font-medium text-ink-muted uppercase'>
              <Icon name='store' className='size-4' />
              {group.brandName ?? 'Tiệm khác'}
            </h3>
            <ul className='flex flex-col gap-2'>
              {group.items.map((item) => (
                <li key={item.productId} className='flex justify-between gap-3'>
                  <span className='min-w-0 text-ink'>
                    {item.title} <span className='text-ink-muted'>× {item.quantity}</span>
                  </span>
                  <span className='shrink-0 text-ink'>
                    {formatMoney(item.unitPrice * item.quantity, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <OrderTotals subtotal={subtotal} deliveryFee={0} totalAmount={subtotal} currency={currency} />
        <p className='text-caption font-light text-ink-muted'>
          Chưa cần thanh toán lúc này. Đơn được gửi tới các tiệm để xác nhận.
        </p>
        {submitError && (
          <Alert
            tone='danger'
            action={
              <ButtonLink href='/cart' variant='outline' size='sm'>
                Về giỏ hàng
              </ButtonLink>
            }
          >
            {submitError}
          </Alert>
        )}
        <Button type='submit' size='lg' block disabled={isSubmitting} className='uppercase'>
          {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
        </Button>
        <Link href='/cart' className='text-center text-body-sm text-ink-muted hover:text-ink hover:underline'>
          Sửa giỏ hàng
        </Link>
      </aside>
    </form>
  );
}

export default function CheckoutPage() {
  const { selectedItems, selectedSubtotal } = useCart();

  return (
    <>
      <PageTitle title='Đặt hàng' />

      <Container size='content' className='pt-14 pb-20'>
        <h1 className='font-heading text-h1 font-semibold text-ink'>Đặt hàng</h1>

        {selectedItems.length === 0 ? (
          <EmptyState
            icon='cart'
            className='mt-8'
            title='Chưa chọn món nào để đặt'
            description='Vào giỏ hàng, tick các món muốn đặt rồi quay lại nhé.'
            action={<ButtonLink href='/cart'>Về giỏ hàng</ButtonLink>}
          />
        ) : (
          <CheckoutForm items={selectedItems} subtotal={selectedSubtotal} />
        )}
      </Container>
    </>
  );
}

CheckoutPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
