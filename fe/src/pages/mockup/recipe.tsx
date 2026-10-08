import Link from 'next/link';

import AuthorBio from '@/components/mockup/recipe/AuthorBio';
import ChecklistCard from '@/components/recipe/detail/ChecklistCard';
import CommentForm from '@/components/mockup/recipe/CommentForm';
import NotesBox from '@/components/mockup/recipe/NotesBox';
import NutritionFacts from '@/components/mockup/recipe/NutritionFacts';
import RecipeStats from '@/components/mockup/recipe/RecipeStats';
import ReviewList from '@/components/mockup/recipe/ReviewList';
import { RECIPES } from '@/components/mockup/data';
import Accordion from '@/components/ui/Accordion';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Callout from '@/components/ui/Callout';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import RatingStars from '@/components/ui/RatingStars';
import RecipeGrid from '@/components/ui/RecipeGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import ShareButtons from '@/components/ui/ShareButtons';
import SiteLayout from '@/components/ui/SiteLayout';
import Switch from '@/components/ui/Switch';

const TIPS = [
  'Nấu bột đến khi tạo thành một khối, đáy nồi có lớp màng mỏng là đạt.',
  'Để bột nguội khoảng 60°C rồi mới cho trứng vào từng quả một.',
  'Bột đạt khi nhấc phới lên tạo hình chữ V và rơi chậm.',
  'Không mở cửa lò trong 20 phút đầu để vỏ bánh không bị xẹp.',
  'Sau khi nướng, xiên một lỗ nhỏ ở đáy bánh để hơi nước thoát ra.',
  'Kem trứng nên được làm lạnh ít nhất 2 giờ trước khi bơm.',
];

const INGREDIENTS = [
  '1 cốc sữa tươi',
  '100 g bơ lạt',
  '120 g bột mì đa dụng',
  '1 thìa cà phê muối',
  '4 quả trứng gà',
  '2 thìa canh đường',
  '300 ml kem tươi',
];

const EQUIPMENT = ['1 nồi đáy dày', '1 tô trộn', '1 tô chịu nhiệt', '1 máy đánh trứng cầm tay', '1 phới dẹt'];

const STEPS = [
  'Đun sôi sữa, bơ, đường và muối. Hạ lửa, cho bột mì vào khuấy đều đến khi bột thành khối mịn.',
  'Chuyển bột sang tô, để nguội bớt rồi cho từng quả trứng vào, đánh đều đến khi bột bóng mịn.',
  'Bơm bột lên khay lót giấy nến thành từng viên tròn khoảng 4 cm, cách nhau 3 cm.',
  'Nướng ở 200°C trong 20 phút, hạ xuống 180°C nướng thêm 10 phút đến khi vỏ vàng đều.',
];

const FAQS = [
  { question: 'Vì sao vỏ bánh su bị xẹp sau khi nướng?', answer: 'Thường do mở cửa lò quá sớm hoặc bánh chưa chín đủ. Hãy nướng thêm vài phút và để bánh nguội trong lò hé cửa.' },
  { question: 'Có thể làm vỏ bánh trước một ngày không?', answer: 'Được. Bảo quản vỏ trong hộp kín, trước khi dùng hâm lại 5 phút ở 160°C cho giòn.' },
  { question: 'Thay kem tươi bằng gì được?', answer: 'Bạn có thể dùng kem sữa chua hoặc kem phô mai tuỳ khẩu vị.' },
  { question: 'Bánh để được bao lâu?', answer: 'Bánh đã bơm kem nên dùng trong ngày, bảo quản ngăn mát tối đa 24 giờ.' },
];

// Mockup: Recipe Details page (Figma node 1:1344)
export default function MockupRecipePage() {
  return (
    <SiteLayout title='Bánh su kem'>
      <Container size='content' className='pt-6'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Trang chủ', href: '/mockup/home' },
            { label: 'Tìm kiếm', href: '/mockup/search' },
            { label: 'Bánh su kem' },
          ]}
        />
        <h1 className='mt-4 text-h1 font-semibold text-ink italic'>Bánh su kem</h1>
        <p className='mt-1 flex flex-wrap items-center gap-x-2.5 text-caption font-light text-ink'>
          <time dateTime='2026-01-10'>10 tháng 1, 2026</time>
          <span>
            Bởi{' '}
            <Link href='/mockup/author' className='text-body-sm font-normal text-ink-muted uppercase hover:underline'>
              Bếp của Mai
            </Link>
          </span>
        </p>
        <RatingStars value={4} count={57} size='md' valuePosition='end' className='mt-2' />

        <div className='mt-12 grid aspect-1420/730 grid-cols-[714fr_706fr]'>
          <ImagePlaceholder iconSize='lg' label='Ảnh bánh su kem 1' className='size-full' />
          <ImagePlaceholder iconSize='lg' label='Ảnh bánh su kem 2' className='size-full' />
        </div>
        <div className='mt-7 flex flex-wrap items-center justify-between gap-4'>
          <Button variant='outline' className='uppercase'>
            <Icon name='bookmark' className='size-5' />
            Lưu
          </Button>
          <ShareButtons />
        </div>

        <section className='mt-16'>
          <h2 className='text-h2 font-semibold text-ink'>Tổng quan</h2>
          <div className='mt-4 flex flex-col gap-7 text-body text-ink-muted'>
            <p>
              Bánh su kem là món bánh Pháp quen thuộc với lớp vỏ choux rỗng ruột và
              nhân kem trứng béo ngậy. Chỉ với những nguyên liệu có sẵn trong bếp,
              bạn có thể làm một mẻ bánh đẹp mắt cho buổi trà chiều.
            </p>
            <p>
              Công thức này hướng dẫn chi tiết từ khâu nấu bột, kiểm tra độ đặc,
              nướng vỏ cho đến nấu kem và bơm nhân, kèm những mẹo nhỏ giúp bạn tránh
              các lỗi thường gặp.
            </p>
          </div>
        </section>

        <section className='mt-10'>
          <h2 className='text-h3 font-medium text-ink'>Mẹo nấu ăn</h2>
          <ul className='mt-4 list-disc pl-6 text-body text-ink-muted'>
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className='mt-10'>
          <h2 className='text-h3 font-medium text-ink'>Liên kết</h2>
          <ul className='mt-6 flex flex-wrap gap-3.5'>
            {['Bánh ngọt', 'Tráng miệng', 'Món Pháp', 'Tiệc trà', 'Dễ làm'].map((tag) => (
              <li key={tag}>
                <Chip href='/mockup/search'>{tag}</Chip>
              </li>
            ))}
          </ul>
        </section>

        {/* Thẻ hướng dẫn nấu */}
        <div className='mt-12 flex flex-col items-end gap-0.5'>
          <div className='flex items-center gap-2'>
            <span className='text-body-sm font-light text-ink'>Chế độ nấu ăn</span>
            <Switch label='Chế độ nấu ăn' />
          </div>
          <p className='text-meta text-ink'>(Giữ màn hình luôn sáng)</p>
        </div>
        <article className='mt-3 flex flex-col gap-8 border-3 border-ink px-4 py-10 sm:px-8'>
          <header className='flex flex-col items-center gap-6 text-center'>
            <h2 className='text-h3 text-ink uppercase'>Bánh su kem</h2>
            <p className='max-w-2xl text-h4 font-light text-ink italic'>
              Khám phá niềm vui làm bánh với công thức su kem đơn giản này. Dùng
              nguyên liệu quen thuộc để tạo nên những chiếc bánh nhẹ, xốp với nhân
              kem mịn — hoàn hảo cho buổi tiệc hay bữa sáng cuối tuần!
            </p>
          </header>
          <RecipeStats />
          <ShareButtons className='justify-center' />
          <div className='flex justify-end'>
            <Button variant='outline' className='uppercase'>
              <Icon name='printer' className='size-5' />
              In
            </Button>
          </div>
          <ChecklistCard
            title='Nguyên liệu'
            items={INGREDIENTS}
            aside={
              <p className='flex items-center gap-4 text-lead'>
                <button type='button' aria-pressed className='text-ink-muted'>
                  METRIC
                </button>
                <span aria-hidden className='h-5 w-0.5 bg-line' />
                <button type='button' aria-pressed={false} className='font-light text-ink-subtle'>
                  US
                </button>
              </p>
            }
            footer={
              <Button className='self-start uppercase'>
                Thêm vào giỏ
                <Icon name='cart' className='size-5' />
              </Button>
            }
          />
          <ChecklistCard title='Dụng cụ' items={EQUIPMENT} />

          <div className='mx-auto mt-6 w-full max-w-196'>
            <ImagePlaceholder
              iconSize='lg'
              label='Ảnh hướng dẫn'
              className='relative aspect-1049/1241 w-full'
            >
              <span aria-hidden className='absolute top-10 text-h3 text-ink'>
                Ảnh hướng dẫn
              </span>
            </ImagePlaceholder>
          </div>

          <ol className='mt-4 divide-y divide-line border-b border-line'>
            {STEPS.map((step, index) => (
              <li key={step} className='flex gap-4 py-3'>
                <span className='shrink-0 text-h5 font-medium text-ink'>Bước {index + 1}.</span>
                <p className='text-body text-ink-muted'>{step}</p>
              </li>
            ))}
          </ol>

          <div className='flex flex-col gap-6 md:flex-row md:items-start'>
            <NutritionFacts />
            <p className='max-w-md text-body-sm text-ink'>
              *Thông tin dinh dưỡng được tính tự động, chỉ mang tính ước lượng và có
              thể thay đổi theo nguyên liệu, thương hiệu và cách chế biến. Nếu cần số
              liệu chính xác, bạn nên tự tính bằng công cụ dinh dưỡng yêu thích.
            </p>
          </div>
        </article>

        <Callout title='Mẹo nhỏ:' className='mx-auto mt-16 max-w-214'>
          Đánh trứng vào bột từng chút một và quan sát độ sánh: bột quá đặc thì vỏ
          nứt, quá lỏng thì bánh không phồng. Khi nhấc phới lên, bột rơi thành hình
          chữ V là vừa đạt.
        </Callout>

        <div className='mt-12 grid gap-8 lg:grid-cols-[624fr_1px_407fr]'>
          <section className='lg:pt-8'>
            <h2 className='mb-5 text-h3 font-medium text-ink'>Câu hỏi thường gặp</h2>
            <Accordion items={FAQS} />
          </section>
          <div aria-hidden className='hidden bg-line lg:block' />
          <NotesBox />
        </div>

        <div className='mt-12'>
          <CommentForm />
        </div>
        <div className='mt-6'>
          <ReviewList />
        </div>
      </Container>

      <section className='mt-12 bg-highlight py-4'>
        <Container className='flex flex-wrap items-center justify-center gap-x-10 gap-y-3'>
          <h2 className='text-h3 font-medium text-ink'>Chia sẻ:</h2>
          <ShareButtons size='md' />
        </Container>
      </section>

      <Container size='content' className='mt-10'>
        <AuthorBio />
      </Container>

      <Container as='section' className='py-16'>
        <SectionHeading title='Thêm công thức tương tự!!' />
        <RecipeGrid recipes={RECIPES.slice(4, 8)} className='mt-8' />
      </Container>
    </SiteLayout>
  );
}
