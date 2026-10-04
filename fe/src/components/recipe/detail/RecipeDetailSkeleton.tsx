// Khung giữ chỗ trang chi tiết công thức, cùng bố cục với trang thật.
export default function RecipeDetailSkeleton() {
  return (
    <div role='status' aria-label='Đang tải chi tiết công thức'>
      <span className='sr-only'>Đang tải chi tiết công thức...</span>
      <div aria-hidden className='mt-4 flex flex-col gap-4 motion-safe:animate-pulse'>
        <div className='h-10 w-2/3 rounded-media bg-surface-soft' />
        <div className='h-4 w-40 rounded-media bg-surface-soft' />
        <div className='mt-4 aspect-1420/730 w-full rounded-media bg-media' />
        <div className='mt-8 h-8 w-48 rounded-media bg-surface-soft' />
        <div className='h-4 w-full rounded-media bg-surface-soft' />
        <div className='h-4 w-5/6 rounded-media bg-surface-soft' />
      </div>
    </div>
  );
}
