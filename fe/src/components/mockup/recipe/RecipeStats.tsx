import Icon, { type IconName } from '@/components/ui/Icon';

type Stat = { label: string; value: string; icon: IconName };

const TOP: Stat[] = [
  { label: 'Chuẩn bị', value: '10 phút', icon: 'timer' },
  { label: 'Nấu', value: '20 phút', icon: 'cooking-pot' },
  { label: 'Tổng thời gian', value: '30 phút', icon: 'clock' },
];

const BOTTOM: Stat[] = [
  { label: 'Khẩu phần', value: '10', icon: 'users' },
  { label: 'Năng lượng', value: '198 Kcal', icon: 'flame' },
];

function StatItem({ stat }: { stat: Stat }) {
  return (
    <div className='flex flex-col items-center gap-1 px-2 py-2 text-center'>
      <Icon name={stat.icon} strokeWidth={1.5} className='size-10 text-primary' />
      <dt className='text-lead font-medium text-ink'>{stat.label}</dt>
      <dd className='text-lead text-ink-subtle'>{stat.value}</dd>
    </div>
  );
}

// Hộp thông số công thức: 3 mốc thời gian trên, khẩu phần + năng lượng dưới.
export default function RecipeStats() {
  return (
    <dl className='mx-auto w-full max-w-170 rounded-panel bg-highlight px-4 py-5'>
      <div className='grid grid-cols-3 divide-x-2 divide-line'>
        {TOP.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
      <div className='my-2 flex items-center gap-3 px-6'>
        <span className='h-0.5 flex-1 rounded-full bg-line' />
        <span className='grid h-9 w-11 place-items-center rounded-full bg-page text-primary-strong'>
          <Icon name='chef-hat' className='size-6' />
        </span>
        <span className='h-0.5 flex-1 rounded-full bg-line' />
      </div>
      <div className='mx-auto grid max-w-md grid-cols-2 divide-x-2 divide-line'>
        {BOTTOM.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </dl>
  );
}
