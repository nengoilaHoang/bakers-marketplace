import { RECIPES } from '@/components/mockup/data';
import Container from '@/components/ui/Container';
import FollowLinks from '@/components/ui/FollowLinks';
import Icon from '@/components/ui/Icon';
import RecipeGrid from '@/components/ui/RecipeGrid';
import SiteLayout from '@/components/ui/SiteLayout';

// Mockup: About Author page (Figma node 1:1886)
export default function MockupAuthorPage() {
  return (
    <SiteLayout title='Bếp của Mai'>
      <Container size='narrow' className='pt-14 pb-20'>
        <header>
          <h1 className='text-h1 font-semibold text-ink'>Bếp của Mai</h1>
          <p className='mt-1 flex items-center gap-2 text-lead text-ink-muted'>
            <Icon name='location' className='size-5' />
            Đà Lạt, Lâm Đồng
          </p>
        </header>

        <section className='mt-7 grid gap-6 md:grid-cols-[548fr_774fr]'>
          <div
            role='img'
            aria-label='Ảnh của Mai'
            className='grid aspect-548/576 place-items-center bg-media text-page'
          >
            <Icon name='user' strokeWidth={1.25} className='size-[30%]' />
          </div>
          <div className='flex flex-col gap-8'>
            <h2 className='text-h1 font-semibold text-ink'>XIN CHÀO!</h2>
            <p className='text-h4 leading-[1.45] text-ink-muted'>
              Mình là Mai, một người mẹ bỉm sữa mê làm bánh. Căn bếp nhỏ ở Đà Lạt là
              nơi mình thử nghiệm những công thức bánh Pháp, bánh mì và các món
              tráng miệng mát lạnh. Mong rằng mỗi công thức ở đây sẽ giúp bạn tự tin
              hơn khi vào bếp.
            </p>
            <FollowLinks />
          </div>
        </section>

        <section className='mt-16'>
          <h2 className='text-h1 font-semibold text-ink'>CÂU CHUYỆN CỦA TÔI</h2>
          <div className='mt-5 flex flex-col gap-6 text-body text-ink-muted'>
            <p>
              Mình bắt đầu làm bánh từ năm 2015, khi con gái đầu lòng tròn một tuổi.
              Những mẻ bánh đầu tiên cháy khét, xẹp lép, nhưng niềm vui khi thấy con
              ăn ngon lành khiến mình không bỏ cuộc.
            </p>
            <p>
              Sau nhiều năm tự học qua sách vở và các lớp ngắn hạn, mình nhận ra bí
              quyết không nằm ở dụng cụ đắt tiền mà ở sự kiên nhẫn: cân đúng nguyên
              liệu, hiểu lò nướng nhà mình và ghi chép lại từng lần thử. Mỗi công
              thức mình chia sẻ đều đi kèm những ghi chú đó.
            </p>
            <p>
              Hiện tại mình nhận đặt bánh theo đơn nhỏ và mở vài lớp học cuối tuần.
              Nếu bạn làm theo công thức của mình, hãy để lại bình luận nhé — mình
              đọc tất cả và rất vui được trò chuyện cùng bạn.
            </p>
          </div>
        </section>

        <section className='mt-16'>
          <h2 className='text-h3 font-medium text-ink'>Thêm từ Bếp của Mai</h2>
          <RecipeGrid recipes={RECIPES.slice(0, 6)} columns={3} className='mt-8 md:px-10' />
        </section>
      </Container>
    </SiteLayout>
  );
}
