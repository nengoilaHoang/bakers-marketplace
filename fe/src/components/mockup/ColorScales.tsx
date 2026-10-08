import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Tailwind chỉ sinh class có tên đầy đủ trong mã nguồn → liệt kê tường minh.
const SCALES: Array<{ name: string; note: string; classes: string[] }> = [
  { name: 'plum', note: 'Chủ đạo — primary', classes: ['bg-plum-50', 'bg-plum-100', 'bg-plum-200', 'bg-plum-300', 'bg-plum-400', 'bg-plum-500', 'bg-plum-600', 'bg-plum-700', 'bg-plum-800', 'bg-plum-900', 'bg-plum-950'] },
  { name: 'rose', note: 'Nhấn — accent (CTA)', classes: ['bg-rose-50', 'bg-rose-100', 'bg-rose-200', 'bg-rose-300', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600', 'bg-rose-700', 'bg-rose-800', 'bg-rose-900', 'bg-rose-950'] },
  { name: 'sage', note: 'Phụ — secondary', classes: ['bg-sage-50', 'bg-sage-100', 'bg-sage-200', 'bg-sage-300', 'bg-sage-400', 'bg-sage-500', 'bg-sage-600', 'bg-sage-700', 'bg-sage-800', 'bg-sage-900', 'bg-sage-950'] },
  { name: 'khaki', note: 'Nền — surface', classes: ['bg-khaki-50', 'bg-khaki-100', 'bg-khaki-200', 'bg-khaki-300', 'bg-khaki-400', 'bg-khaki-500', 'bg-khaki-600', 'bg-khaki-700', 'bg-khaki-800', 'bg-khaki-900', 'bg-khaki-950'] },
  { name: 'peach', note: 'Nổi bật — highlight', classes: ['bg-peach-50', 'bg-peach-100', 'bg-peach-200', 'bg-peach-300', 'bg-peach-400', 'bg-peach-500', 'bg-peach-600', 'bg-peach-700', 'bg-peach-800', 'bg-peach-900', 'bg-peach-950'] },
  { name: 'neutral', note: 'Xám ấm — chữ, viền, nền', classes: ['bg-neutral-50', 'bg-neutral-100', 'bg-neutral-200', 'bg-neutral-300', 'bg-neutral-400', 'bg-neutral-500', 'bg-neutral-600', 'bg-neutral-700', 'bg-neutral-800', 'bg-neutral-900', 'bg-neutral-950'] },
  { name: 'success', note: 'Thành công', classes: ['bg-success-50', 'bg-success-100', 'bg-success-200', 'bg-success-300', 'bg-success-400', 'bg-success-500', 'bg-success-600', 'bg-success-700', 'bg-success-800', 'bg-success-900', 'bg-success-950'] },
  { name: 'warning', note: 'Cảnh báo', classes: ['bg-warning-50', 'bg-warning-100', 'bg-warning-200', 'bg-warning-300', 'bg-warning-400', 'bg-warning-500', 'bg-warning-600', 'bg-warning-700', 'bg-warning-800', 'bg-warning-900', 'bg-warning-950'] },
  { name: 'danger', note: 'Lỗi', classes: ['bg-danger-50', 'bg-danger-100', 'bg-danger-200', 'bg-danger-300', 'bg-danger-400', 'bg-danger-500', 'bg-danger-600', 'bg-danger-700', 'bg-danger-800', 'bg-danger-900', 'bg-danger-950'] },
  { name: 'info', note: 'Thông tin', classes: ['bg-info-50', 'bg-info-100', 'bg-info-200', 'bg-info-300', 'bg-info-400', 'bg-info-500', 'bg-info-600', 'bg-info-700', 'bg-info-800', 'bg-info-900', 'bg-info-950'] },
];

// Đổi màu CSS bất kỳ (oklch…) sang mã hex để hiển thị.
function toHex(color: string) {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return { hex: '', dark: false };
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { hex: hex.toUpperCase(), dark: luminance < 0.55 };
}

function Swatch({ className, step }: { className: string; step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState({ hex: '', dark: step >= 600 });

  useEffect(() => {
    if (ref.current) setInfo(toHex(getComputedStyle(ref.current).backgroundColor));
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-14 flex-col justify-between rounded-control px-2 py-1.5 text-micro',
        className,
        info.dark ? 'text-page' : 'text-ink',
      )}
    >
      <span className='font-semibold'>{step}</span>
      <span className='font-light'>{info.hex}</span>
    </div>
  );
}

// Bảng thang màu 50→950 (chỉ dùng cho trang styleguide).
export default function ColorScales() {
  return (
    <div className='flex flex-col gap-4 overflow-x-auto'>
      {SCALES.map((scale) => (
        <div key={scale.name} className='grid min-w-224 grid-cols-[8rem_repeat(11,1fr)] items-center gap-1.5'>
          <div>
            <p className='text-body-sm font-semibold text-ink'>{scale.name}</p>
            <p className='text-micro text-ink-muted'>{scale.note}</p>
          </div>
          {scale.classes.map((className, index) => (
            <Swatch key={className} className={className} step={STEPS[index]} />
          ))}
        </div>
      ))}
    </div>
  );
}
