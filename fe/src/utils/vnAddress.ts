import provinces from '@/data/vn-provinces.json';

// Địa giới hành chính Việt Nam sau sắp xếp 2025: 2 cấp tỉnh / thành phố → phường / xã (không còn quận / huyện).
// Dữ liệu: src/data/vn-provinces.json (34 tỉnh) và vn-wards.json (≈3.300 phường / xã, theo provinceCode).
export type VnProvince = { code: string; name: string };
export type VnWard = { code: string; name: string; provinceCode: string };

// Bỏ tiền tố "Thành phố" / "Tỉnh" khi sắp xếp để tìm theo tên riêng (An Giang, Bắc Ninh, Cần Thơ...).
const sortKey = (name: string) => name.replace(/^(Thành phố|Tỉnh)\s+/, '');

export const VN_PROVINCES: VnProvince[] = [...provinces].sort((a, b) =>
  sortKey(a.name).localeCompare(sortKey(b.name), 'vi'),
);

let wardsPromise: Promise<VnWard[]> | null = null;

// Danh sách phường / xã khá nặng (~220 kB) nên chỉ tải khi cần, và tải một lần.
export function loadWards(): Promise<VnWard[]> {
  wardsPromise ??= import('@/data/vn-wards.json').then((module) =>
    [...(module.default as VnWard[])].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
  );
  return wardsPromise;
}
