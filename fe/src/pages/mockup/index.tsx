import Link from 'next/link';
import type { ReactNode } from 'react';

import ColorScales from '@/components/mockup/ColorScales';
import { ARTICLES, COLLECTIONS, RECIPES } from '@/components/mockup/data';
import Accordion from '@/components/ui/Accordion';
import Alert from '@/components/ui/Alert';
import ArticleCard from '@/components/ui/ArticleCard';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Callout from '@/components/ui/Callout';
import CategoryCircle from '@/components/ui/CategoryCircle';
import Checkbox from '@/components/ui/Checkbox';
import Chip from '@/components/ui/Chip';
import CollectionCard, { NewCollectionCard } from '@/components/ui/CollectionCard';
import Container from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import FollowLinks from '@/components/ui/FollowLinks';
import Icon, { ICON_NAMES } from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import Input, { PasswordInput, Textarea } from '@/components/ui/Input';
import Logo, { LogoMark } from '@/components/ui/Logo';
import PillTabs from '@/components/ui/PillTabs';
import PlusCircle from '@/components/ui/PlusCircle';
import RatingStars, { RatingInput } from '@/components/ui/RatingStars';
import RecipeCard from '@/components/ui/RecipeCard';
import RecipeGrid from '@/components/ui/RecipeGrid';
import SearchBar from '@/components/ui/SearchBar';
import SectionHeading from '@/components/ui/SectionHeading';
import Select from '@/components/ui/Select';
import ShareButtons from '@/components/ui/ShareButtons';
import SiteHeader from '@/components/ui/SiteHeader';
import SiteLayout from '@/components/ui/SiteLayout';
import SocialButton from '@/components/ui/SocialButton';
import Switch from '@/components/ui/Switch';

const PAGES = [
  { href: '/mockup/home', label: 'Trang chủ' },
  { href: '/mockup/search', label: 'Kết quả tìm kiếm' },
  { href: '/mockup/recipe', label: 'Chi tiết công thức' },
  { href: '/mockup/author', label: 'Giới thiệu tác giả' },
  { href: '/mockup/add-recipe', label: 'Thêm công thức' },
  { href: '/mockup/profile', label: 'Hồ sơ của tôi' },
  { href: '/mockup/saved', label: 'Công thức đã lưu' },
  { href: '/mockup/login', label: 'Đăng nhập' },
  { href: '/mockup/signup', label: 'Đăng ký' },
];

const PALETTE = [
  { name: 'plum-500', hex: '#69585F', className: 'bg-plum-500' },
  { name: 'rose-500', hex: '#EF959D', className: 'bg-rose-500' },
  { name: 'sage-500', hex: '#B8D8BA', className: 'bg-sage-500' },
  { name: 'khaki-500', hex: '#D9DBBC', className: 'bg-khaki-500' },
  { name: 'peach-500', hex: '#FCDDBC', className: 'bg-peach-500' },
  { name: 'success-500', hex: '#3E9B63', className: 'bg-success-500' },
  { name: 'warning-500', hex: '#E0A030', className: 'bg-warning-500' },
  { name: 'danger-500', hex: '#D64545', className: 'bg-danger-500' },
  { name: 'info-500', hex: '#4A86C5', className: 'bg-info-500' },
];

const ROLES: Array<{ token: string; swatch: string; step: string; use: string }> = [
  { token: 'primary', swatch: 'bg-primary', step: 'plum-500', use: 'Section nền đậm, nhấn thương hiệu' },
  { token: 'primary-strong', swatch: 'bg-primary-strong', step: 'plum-700', use: 'Banner đậm hơn' },
  { token: 'primary-deep', swatch: 'bg-primary-deep', step: 'plum-900', use: 'Footer' },
  { token: 'primary-soft', swatch: 'bg-primary-soft', step: 'plum-300', use: 'Tab, ảnh đại diện, ảnh trên nền đậm' },
  { token: 'primary-tint', swatch: 'bg-primary-tint', step: 'plum-50', use: 'Nền rất nhạt (bảng dinh dưỡng)' },
  { token: 'on-primary', swatch: 'bg-on-primary', step: '#FFFFFF', use: 'Chữ/icon đặt trên nền primary' },
  { token: 'accent', swatch: 'bg-accent', step: 'rose-500', use: 'Nút CTA — chữ tối' },
  { token: 'accent-strong', swatch: 'bg-accent-strong', step: 'rose-600', use: 'Hover của CTA' },
  { token: 'accent-soft', swatch: 'bg-accent-soft', step: 'rose-100', use: 'Nền nhấn nhẹ màu hồng' },
  { token: 'on-accent', swatch: 'bg-on-accent', step: 'neutral-900', use: 'Chữ đặt trên nền accent (nút CTA)' },
  { token: 'secondary', swatch: 'bg-secondary', step: 'sage-500', use: 'Badge, tag, trạng thái chọn' },
  { token: 'secondary-soft', swatch: 'bg-secondary-soft', step: 'sage-200', use: 'Nền nhạt màu xanh' },
  { token: 'on-secondary', swatch: 'bg-on-secondary', step: 'neutral-900', use: 'Chữ đặt trên nền secondary (badge)' },
  { token: 'surface', swatch: 'bg-surface', step: 'khaki-500', use: 'Nền form / panel' },
  { token: 'surface-soft', swatch: 'bg-surface-soft', step: 'khaki-200', use: 'Nền phụ, ô tìm kiếm' },
  { token: 'highlight', swatch: 'bg-highlight', step: 'peach-500', use: 'Hộp thông tin, thanh chia sẻ' },
  { token: 'highlight-soft', swatch: 'bg-highlight-soft', step: 'peach-200', use: 'Hover danh sách, nền nhấn rất nhẹ' },
  { token: 'media', swatch: 'bg-media', step: 'khaki-500 + chút plum', use: 'Placeholder ảnh' },
  { token: 'page', swatch: 'bg-page', step: '#FFFFFF', use: 'Nền trang' },
  { token: 'field', swatch: 'bg-field', step: 'neutral-50', use: 'Nền ô nhập' },
  { token: 'ink', swatch: 'bg-ink', step: 'neutral-900', use: 'Chữ chính, viền nút' },
  { token: 'ink-muted', swatch: 'bg-ink-muted', step: 'neutral-700', use: 'Chữ phụ, đoạn văn' },
  { token: 'ink-subtle', swatch: 'bg-ink-subtle', step: 'neutral-500', use: 'Chữ mờ, sao chưa chấm' },
  { token: 'placeholder', swatch: 'bg-placeholder', step: 'neutral-400', use: 'Chữ gợi ý trong ô nhập' },
  { token: 'border', swatch: 'bg-border', step: 'neutral-400', use: 'Viền ô nhập' },
  { token: 'border-soft', swatch: 'bg-border-soft', step: 'neutral-300', use: 'Viền nhẹ (chip, thẻ phụ)' },
  { token: 'line', swatch: 'bg-line', step: 'neutral-200', use: 'Đường kẻ, divider' },
];

// Mỗi trạng thái: nền nhạt (-soft), viền (-border), màu chính, chữ đậm (-strong).
const STATUSES = [
  { tone: 'success', label: 'Thành công', classes: ['bg-success-soft', 'bg-success-border', 'bg-success', 'bg-success-strong'] },
  { tone: 'warning', label: 'Cảnh báo', classes: ['bg-warning-soft', 'bg-warning-border', 'bg-warning', 'bg-warning-strong'] },
  { tone: 'danger', label: 'Lỗi', classes: ['bg-danger-soft', 'bg-danger-border', 'bg-danger', 'bg-danger-strong'] },
  { tone: 'info', label: 'Thông tin', classes: ['bg-info-soft', 'bg-info-border', 'bg-info', 'bg-info-strong'] },
] as const;

const STATUS_PARTS = ['-soft (50)', '-border (200)', 'chính (500)', '-strong (700)'];

const ALERT_SAMPLES = {
  success: { title: 'Đã lưu công thức', text: 'Công thức của bạn đã được đăng thành công.' },
  warning: { title: 'Sắp hết hàng', text: 'Nguyên liệu này chỉ còn 2 sản phẩm.' },
  danger: { title: 'Không gửi được bình luận', text: 'Vui lòng kiểm tra kết nối và thử lại.' },
  info: { title: 'Mẹo', text: 'Bạn có thể lưu công thức vào bộ sưu tập để xem lại sau.' },
} as const;

const CONTAINERS = [
  { token: 'max-w-page', size: '1216px', use: 'Trang danh sách, lưới 4 thẻ', className: 'max-w-page' },
  { token: 'max-w-content', size: '1064px', use: 'Trang chi tiết (công thức, bài viết)', className: 'max-w-content' },
  { token: 'max-w-narrow', size: '992px', use: 'Form, hồ sơ, tác giả', className: 'max-w-narrow' },
];

const RADII = [
  { token: 'rounded-media', size: '6px', use: 'Ảnh', className: 'rounded-media' },
  { token: 'rounded-control', size: '8px', use: 'Nút rộng, select, FAQ', className: 'rounded-control' },
  { token: 'rounded-box', size: '12px', use: 'Hộp nội dung, callout, ghi chú', className: 'rounded-box' },
  { token: 'rounded-field', size: '14px', use: 'Ô nhập, textarea', className: 'rounded-field' },
  { token: 'rounded-panel', size: '16px', use: 'Panel lớn, hộp thông số', className: 'rounded-panel' },
  { token: 'rounded-modal', size: '20px', use: 'Hộp đăng nhập, logo đóng khung', className: 'rounded-modal' },
  { token: 'rounded-full', size: 'tròn', use: 'Nút, tag, tab, avatar', className: 'rounded-full' },
];

const SHADOWS = [
  { token: 'shadow-card', use: 'Thẻ công thức (bóng hai phía)', className: 'shadow-card' },
  { token: 'shadow-header', use: 'Header, tab viên thuốc', className: 'shadow-header' },
  { token: 'shadow-raised', use: 'Form lớn nổi trên nền', className: 'shadow-raised' },
  { token: 'shadow-soft', use: 'Dropdown, dải thông số', className: 'shadow-soft' },
];

const TYPE_SCALE = [
  { token: 'text-display', sample: 'Thưởng thức trọn vị', className: 'text-display font-semibold' },
  { token: 'text-h1', sample: 'Bánh su kem', className: 'text-h1 font-semibold' },
  { token: 'text-h2 + font-heading', sample: 'Mới cập nhật', className: 'font-heading text-h2 font-semibold' },
  { token: 'text-h3', sample: 'Nguyên liệu', className: 'text-h3 font-medium' },
  { token: 'text-h4', sample: 'Lựa chọn của tuần', className: 'text-h4 font-medium' },
  { token: 'text-h5', sample: 'Bước 1.', className: 'text-h5 font-medium' },
  { token: 'text-lead', sample: 'Nhãn form, menu điều hướng', className: 'text-lead font-medium' },
  { token: 'text-body', sample: 'Đoạn văn nội dung chính của bài viết và công thức.', className: 'text-body text-ink-muted' },
  { token: 'text-body-sm', sample: 'Nội dung ô nhập, bình luận, nhãn đăng nhập', className: 'text-body-sm' },
  { token: 'text-caption', sample: 'DANH MỤC · chú thích · breadcrumb', className: 'text-caption' },
  { token: 'text-meta', sample: 'TÊN TÁC GIẢ · NGÀY ĐĂNG', className: 'text-meta uppercase' },
  { token: 'text-micro', sample: 'NÂNG CAO · (18)', className: 'text-micro' },
  { token: 'font-brand', sample: 'BAKERS MARKETPLACE', className: 'font-brand text-h2 font-bold' },
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-t border-line pt-8'>
      <h2 className='font-heading text-h2 font-semibold text-ink'>{title}</h2>
      <div className='mt-6'>{children}</div>
    </section>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-meta font-medium text-ink-subtle uppercase'>{label}</p>
      <div className='flex flex-wrap items-center gap-3'>{children}</div>
    </div>
  );
}

// Mockup index + styleguide: danh sách trang mockup và toàn bộ token / component.
export default function MockupIndexPage() {
  return (
    <SiteLayout title='Mockup & Styleguide'>
      <Container className='flex flex-col gap-14 py-14'>
        <header className='flex flex-col gap-3'>
          <p className='text-meta font-medium text-ink-subtle uppercase'>Mockup UI</p>
          <h1 className='text-h1 font-semibold text-ink'>Styleguide & danh sách trang</h1>
          <p className='max-w-2xl text-body text-ink-muted'>
            Toàn bộ trang dưới đây dựng từ bộ token trong <code>src/styles/globals.css</code> và
            component trong <code>src/components/ui</code>. Sửa một mã màu trong bảng màu 50→950
            là mọi nơi dùng màu đó đổi theo.
          </p>
        </header>

        <Block title='Các trang'>
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className='flex items-center justify-between gap-3 rounded-box border border-border-soft px-4 py-3 transition-colors outline-none hover:border-accent hover:bg-accent-soft/40 focus-visible:ring-2 focus-visible:ring-accent'
                >
                  <span className='text-lead font-medium text-ink'>{page.label}</span>
                  <span className='flex items-center gap-1 text-caption text-ink-subtle'>
                    {page.href}
                    <Icon name='arrow-right' className='size-4' />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Màu gốc (bậc 500)'>
          <ul className='grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9'>
            {PALETTE.map((color) => (
              <li key={color.name}>
                <div className={`h-24 rounded-box border border-border-soft ${color.className}`} />
                <p className='mt-2 text-caption font-medium text-ink'>{color.hex}</p>
                <p className='text-meta text-ink-muted'>{color.name}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Thang màu 50 → 950'>
          <p className='mb-4 text-body-sm text-ink-muted'>
            Bậc 500 là màu gốc. Dùng trực tiếp khi cần sắc độ riêng:{' '}
            <code>bg-plum-100</code>, <code>text-rose-700</code>, <code>border-neutral-300</code>…
          </p>
          <ColorScales />
        </Block>

        <Block title='Vai trò màu (token)'>
          <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {ROLES.map((role) => (
              <li key={role.token} className='flex items-center gap-3'>
                <span className={`size-12 shrink-0 rounded-control border border-border-soft ${role.swatch}`} />
                <span>
                  <span className='block text-body-sm font-medium text-ink'>
                    {role.token} <span className='font-light text-ink-subtle'>= {role.step}</span>
                  </span>
                  <span className='block text-caption text-ink-muted'>{role.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Trạng thái & thông báo'>
          <div className='grid gap-8 lg:grid-cols-2'>
            <div className='flex flex-col gap-3'>
              <div className='grid grid-cols-[6rem_repeat(4,1fr)] gap-2 text-micro text-ink-muted'>
                <span />
                {STATUS_PARTS.map((part) => (
                  <span key={part}>{part}</span>
                ))}
              </div>
              {STATUSES.map((status) => (
                <div key={status.tone} className='grid grid-cols-[6rem_repeat(4,1fr)] items-center gap-2'>
                  <span className='text-body-sm font-medium text-ink'>
                    {status.tone}
                    <span className='block text-micro font-normal text-ink-muted'>{status.label}</span>
                  </span>
                  {status.classes.map((className) => (
                    <span key={className} className={`h-10 rounded-control border border-border-soft ${className}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className='flex flex-col gap-3'>
              {STATUSES.map((status) => (
                <Alert key={status.tone} tone={status.tone} title={ALERT_SAMPLES[status.tone].title}>
                  {ALERT_SAMPLES[status.tone].text}
                </Alert>
              ))}
            </div>
            <div className='lg:col-span-2'>
              <p className='mb-3 text-meta font-medium text-ink-subtle uppercase'>ErrorState — lỗi tải dữ liệu</p>
              <ErrorState
                compact
                message='Không kết nối được máy chủ. Vui lòng thử lại sau ít phút.'
                onRetry={() => undefined}
              />
            </div>
          </div>
        </Block>

        <Block title='Kiểu chữ'>
          <ul className='flex flex-col gap-4'>
            {TYPE_SCALE.map((type) => (
              <li key={type.token} className='grid items-baseline gap-2 sm:grid-cols-[12rem_1fr]'>
                <code className='text-caption text-ink-subtle'>{type.token}</code>
                <span className={type.className}>{type.sample}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Bo góc & đổ bóng'>
          <ul className='grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7'>
            {RADII.map((radius) => (
              <li key={radius.token} className='flex flex-col gap-2'>
                <div className={`h-20 border-2 border-primary bg-surface-soft ${radius.className}`} />
                <code className='text-caption text-ink'>{radius.token}</code>
                <span className='text-meta text-ink-muted'>
                  {radius.size} · {radius.use}
                </span>
              </li>
            ))}
          </ul>
          <ul className='mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4'>
            {SHADOWS.map((shadow) => (
              <li key={shadow.token} className='flex flex-col gap-3'>
                <div className={`h-20 rounded-box bg-page ${shadow.className}`} />
                <code className='text-caption text-ink'>{shadow.token}</code>
                <span className='text-meta text-ink-muted'>{shadow.use}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Độ rộng nội dung'>
          <ul className='flex flex-col gap-4'>
            {CONTAINERS.map((container) => (
              <li key={container.token} className='flex flex-col gap-1.5'>
                <div className={`flex h-10 w-full items-center rounded-control bg-primary-soft px-3 text-caption text-ink ${container.className}`}>
                  <code>{container.token}</code>
                </div>
                <span className='text-meta text-ink-muted'>
                  {container.size} · {container.use} · dùng qua <code>{"<Container size='…'>"}</code>
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Logo & header'>
          <div className='flex flex-col gap-8'>
            <Demo label='Logo — biến thể'>
              <Logo />
              <Logo size='sm' />
              <span className='inline-flex items-center gap-3'>
                <LogoMark /> <LogoMark size='sm' />
              </span>
              <Logo boxed />
              <span className='rounded-panel bg-primary-deep px-4 py-3'>
                <Logo tone='inverse' />
              </span>
            </Demo>
            <div className='flex flex-col gap-3'>
              <p className='text-meta font-medium text-ink-subtle uppercase'>SiteHeader — khách (chưa đăng nhập)</p>
              <div className='rounded-box border border-border-soft'>
                <SiteHeader variant='guest' />
              </div>
              <p className='mt-3 text-meta font-medium text-ink-subtle uppercase'>SiteHeader — thành viên (đã đăng nhập)</p>
              <div className='rounded-box border border-border-soft'>
                <SiteHeader variant='member' />
              </div>
              <p className='text-caption text-ink-muted'>SiteFooter: xem cuối trang này.</p>
            </div>
          </div>
        </Block>

        <Block title='Icon (Lucide)'>
          <p className='mb-4 text-body-sm text-ink-muted'>
            Dùng <code>{'<Icon name=\'…\' />'}</code>. Cần icon khác: tìm trên lucide.dev rồi thêm vào{' '}
            <code>src/components/ui/Icon.tsx</code>.
          </p>
          <ul className='grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8'>
            {ICON_NAMES.map((name) => (
              <li
                key={name}
                className='flex flex-col items-center gap-2 rounded-box border border-border-soft px-2 py-3'
              >
                <Icon name={name} className='size-6 text-ink' />
                <code className='text-micro text-ink-muted'>{name}</code>
              </li>
            ))}
          </ul>
        </Block>

        <Block title='Nút & điều khiển'>
          <div className='grid gap-8 lg:grid-cols-2'>
            <Demo label='Button (ButtonLink cùng kiểu) — variant'>
              <Button>Primary</Button>
              <Button variant='outline'>Outline</Button>
              <Button variant='ghost'>Ghost</Button>
              <span className='rounded-control bg-primary p-3'>
                <Button variant='outline-inverse'>Outline inverse</Button>
              </span>
            </Demo>
            <Demo label='Button — size'>
              <Button size='sm'>Small</Button>
              <Button size='md'>Medium</Button>
              <Button size='lg'>Large</Button>
              <Button size='lg' shape='rounded'>Rounded</Button>
            </Demo>
            <Demo label='IconButton (IconLink cùng kiểu) / ShareButtons / FollowLinks'>
              <IconButton label='Lưu'>
                <Icon name='bookmark' />
              </IconButton>
              <IconButton label='Website' variant='muted'>
                <Icon name='globe' />
              </IconButton>
              <ShareButtons />
              <FollowLinks />
            </Demo>
            <Demo label='Badge / Chip / Rating'>
              <Badge>Nâng cao</Badge>
              <Badge tone='highlight'>Mới</Badge>
              <Chip href='#'>Bánh ngọt</Chip>
              <Chip href='#' active>
                Đang chọn
              </Chip>
              <RatingStars value={4} count={18} />
              <RatingStars value={4.5} count={57} size='md' valuePosition='end' />
            </Demo>
            <Demo label='Checkbox / Switch / RatingInput'>
              <Checkbox label='Bạn đã làm thử món này?' />
              <Switch label='Chế độ nấu ăn' />
              <RatingInput name='demo-rating' label='Chấm điểm' defaultValue={3} />
            </Demo>
            <Demo label='Trạng thái — disabled'>
              <Button disabled>Primary</Button>
              <Button variant='outline' disabled>
                Outline
              </Button>
              <IconButton label='Lưu' disabled>
                <Icon name='bookmark' />
              </IconButton>
            </Demo>
            <Demo label='SocialButton / PlusCircle'>
              <span className='flex w-full max-w-md gap-2.5'>
                <SocialButton provider='google' action='Đăng nhập' />
                <SocialButton provider='facebook' action='Đăng nhập' />
              </span>
              <PlusCircle className='size-6' />
              <PlusCircle className='size-9' />
              <PlusCircle tone='outline' className='size-9 text-ink-muted' />
            </Demo>
            <Demo label='Breadcrumb / PillTabs'>
              <Breadcrumb items={[{ label: 'Trang chủ', href: '#' }, { label: 'Tìm kiếm', href: '#' }, { label: 'Bánh su kem' }]} />
              <PillTabs
                label='Demo tab'
                items={[
                  { label: 'Hồ sơ', href: '#profile', active: true },
                  { label: 'Đã lưu', href: '#saved' },
                ]}
              />
            </Demo>
          </div>
        </Block>

        <Block title='Form'>
          <div className='grid gap-6 lg:grid-cols-2'>
            <Field label='Tên công thức' htmlFor='demo-name' required>
              <Input id='demo-name' placeholder='Nhập tên công thức' />
            </Field>
            <Field label='Mật khẩu' htmlFor='demo-password' size='sm'>
              <PasswordInput id='demo-password' placeholder='Nhập mật khẩu' />
            </Field>
            <Field label='Nguyên liệu (tone accent)' htmlFor='demo-accent' hint='Dùng trong danh sách có thể thêm/xoá'>
              <Input id='demo-accent' tone='accent' size='sm' placeholder='Tên nguyên liệu' />
            </Field>
            <Field label='Bộ lọc' htmlFor='demo-select'>
              <Select id='demo-select' wrapperClassName='w-44'>
                <option>Bữa ăn</option>
                <option>Bữa sáng</option>
              </Select>
            </Field>
            <Field label='Email (trạng thái lỗi)' htmlFor='demo-error' required error='Email không đúng định dạng.'>
              <Input id='demo-error' type='email' defaultValue='mai@' aria-invalid />
            </Field>
            <Field label='Sắp xếp (tone plain)' htmlFor='demo-sort'>
              <Select id='demo-sort' tone='plain' wrapperClassName='w-44'>
                <option>Mới nhất</option>
                <option>Phổ biến</option>
              </Select>
            </Field>
            <Field label='Ghi chú' htmlFor='demo-textarea' className='lg:col-span-2'>
              <Textarea id='demo-textarea' placeholder='Viết vài dòng…' />
            </Field>
            <div className='flex flex-col gap-3'>
              <SearchBar id='demo-search-compact' />
              <SearchBar id='demo-search-hero' variant='hero' />
            </div>
          </div>
        </Block>

        <Block title='Thẻ nội dung'>
          <div className='flex flex-col gap-10'>
            <SectionHeading title='SectionHeading' actionHref='#' />
            <div className='flex flex-col gap-3'>
              <p className='text-meta font-medium text-ink-subtle uppercase'>RecipeGrid (lưới 1 → 2 → 4 cột) + RecipeCard</p>
              <RecipeGrid recipes={RECIPES.slice(0, 4)} />
            </div>
            <div className='grid gap-7.5 sm:grid-cols-2 lg:grid-cols-4'>
              <RecipeCard recipe={RECIPES[1]} saved />
              <CollectionCard collection={COLLECTIONS[0]} />
              <CollectionCard collection={COLLECTIONS[1]} />
              <NewCollectionCard />
            </div>
            <div className='flex flex-col gap-3'>
              <p className='text-meta font-medium text-ink-subtle uppercase'>ImagePlaceholder — tone media / primary-soft / primary · icon sm / md / lg</p>
              <div className='grid grid-cols-3 gap-4'>
                <ImagePlaceholder iconSize='sm' className='aspect-4/3 rounded-media' />
                <ImagePlaceholder tone='primary-soft' className='aspect-4/3 rounded-media' />
                <ImagePlaceholder tone='primary' iconSize='lg' className='aspect-4/3 rounded-media' />
              </div>
            </div>
            <ArticleCard article={ARTICLES[0]} className='max-w-200' />
            <div className='grid max-w-2xl grid-cols-3 gap-3 rounded-panel bg-primary p-4'>
              <CategoryCircle label='Bánh mì' href='#' />
              <CategoryCircle label='Cookie' href='#' />
              <CategoryCircle label='Xem tất cả' href='#' withArrow />
            </div>
            <div className='flex items-end gap-6'>
              <Avatar size='sm' />
              <Avatar size='md' />
              <Avatar size='lg' editable />
            </div>
            <Accordion
              className='max-w-xl'
              items={[
                { question: 'Câu hỏi thường gặp?', answer: 'Nội dung trả lời hiện khi mở.' },
                { question: 'Có thể mở nhiều mục cùng lúc?', answer: 'Có, mỗi mục độc lập.' },
              ]}
            />
            <Callout title='Mẹo nhỏ:' className='max-w-2xl'>
              Khối nổi bật trên nền primary, dùng cho mẹo hay lưu ý quan trọng.
            </Callout>
          </div>
        </Block>
      </Container>
    </SiteLayout>
  );
}
