import CategoryCircle from '@/components/ui/CategoryCircle';
import Container from '@/components/ui/Container';

const TOPICS = ['Bánh mì', 'Bánh kem', 'Cookie', 'Chocolate', 'Healthy', 'Dễ làm'];

// Dải primary với các chủ đề tròn — mỗi chủ đề mở trang tìm công thức theo từ khoá đó.
export default function TopicSection() {
  return (
    <section className='bg-primary py-14 text-on-primary lg:py-16'>
      <Container className='flex flex-col items-center gap-8'>
        <h2 className='text-center text-h3 font-medium uppercase'>
          Hôm nay bạn muốn làm bánh gì?
        </h2>
        <ul className='grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
          {TOPICS.map((topic) => (
            <li key={topic}>
              <CategoryCircle
                label={topic}
                href={`/recipes/search?q=${encodeURIComponent(topic)}`}
              />
            </li>
          ))}
          <li>
            <CategoryCircle label='Xem tất cả' href='/recipes' withArrow />
          </li>
        </ul>
      </Container>
    </section>
  );
}
