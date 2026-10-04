import SearchHero from '@/components/mockup/search/SearchHero';
import { RECIPES } from '@/components/mockup/data';
import Container from '@/components/ui/Container';
import RecipeGrid from '@/components/ui/RecipeGrid';
import Select from '@/components/ui/Select';
import SiteLayout from '@/components/ui/SiteLayout';

const FILTERS = [
  { label: 'Loại món', options: ['Khai vị', 'Món phụ', 'Tráng miệng', 'Đồ uống'] },
  { label: 'Bữa ăn', options: ['Bữa sáng', 'Bữa trưa', 'Ăn vặt', 'Bữa tối'] },
  { label: 'Chế độ ăn', options: ['Không gluten', 'Thuần chay', 'Ít tinh bột'] },
  { label: 'Đạm', options: ['Thịt', 'Hải sản', 'Trứng'] },
  { label: 'Nguyên liệu', options: ['Bột mì', 'Bơ', 'Socola', 'Trái cây'] },
  { label: 'Thời gian', options: ['Dưới 30 phút', '30–60 phút', 'Trên 1 giờ'] },
];

const SORT_OPTIONS = ['Mới nhất', 'Liên quan', 'Phổ biến', 'Đánh giá cao'];

// Mockup: Search Results page (Figma node 1:1303)
export default function MockupSearchPage() {
  return (
    <SiteLayout title='Tìm kiếm công thức'>
      <SearchHero />

      <Container className='pt-5 pb-20'>
        <div className='flex items-center justify-end gap-2'>
          <label htmlFor='sort-by' className='text-body-sm text-ink-muted'>
            Sắp xếp:
          </label>
          <Select id='sort-by' tone='plain' wrapperClassName='w-44'>
            {SORT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </Select>
        </div>

        <h2 className='mt-6 text-h3 font-medium text-ink uppercase'>Lọc theo:</h2>
        <ul className='mt-4 flex flex-wrap justify-center gap-3.5'>
          {FILTERS.map((filter) => (
            <li key={filter.label}>
              <Select aria-label={filter.label} defaultValue='' wrapperClassName='w-40'>
                <option value='' disabled>
                  {filter.label}
                </option>
                {filter.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </li>
          ))}
        </ul>

        <RecipeGrid recipes={RECIPES} className='mt-10' />
      </Container>
    </SiteLayout>
  );
}
