import {
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CirclePlus,
  Clock,
  CookingPot,
  Copyright,
  Eye,
  EyeOff,
  File,
  Flag,
  Flame,
  Globe,
  GripVertical,
  HandPlatter,
  Heart,
  ImageIcon,
  Info,
  Lightbulb,
  Link2,
  ListFilter,
  type LucideIcon,
  type LucideProps,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  NotebookPen,
  Plus,
  Printer,
  Reply,
  RotateCcw,
  Search,
  Share2,
  ShoppingCart,
  Smartphone,
  SquarePen,
  SquareX,
  Star,
  Summary,
  ThumbsUp,
  Timer,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
  Utensils,
  Wheat,
  X,
} from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

const TriangleLeft = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
    width='16'
    height='16'
    fill='currentColor'
    viewBox='0 0 16 16'
    ref={ref}
    {...props}
  >
    <path d='m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z' />
  </svg>
));
TriangleLeft.displayName = 'TriangleLeft';

// Bộ icon duy nhất của dự án: Lucide (https://lucide.dev/icons).
// Cần icon mới → import từ 'lucide-react' và thêm một dòng vào đây.
const ICONS = {
  'arrow-right': ArrowRight,
  bookmark: Bookmark,
  camera: Camera,
  cart: ShoppingCart,
  check: Check,
  'chef-hat': ChefHat,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  clock: Clock,
  close: X,
  'cooking-pot': CookingPot,
  copyright: Copyright,
  edit: SquarePen,
  eye: Eye,
  'eye-off': EyeOff,
  filter: ListFilter,
  file: File,
  flag: Flag,
  flame: Flame,
  globe: Globe,
  'grip-vertical': GripVertical,
  'hand-platter': HandPlatter,
  heart: Heart,
  help: CircleHelp,
  image: ImageIcon,
  info: Info,
  lightbulb: Lightbulb,
  link: Link2,
  location: MapPin,
  mail: Mail,
  menu: Menu,
  message: MessageCircle,
  minus: Minus,
  notebook: NotebookPen,
  plus: Plus,
  'plus-circle': CirclePlus,
  printer: Printer,
  refresh: RotateCcw,
  remove: SquareX,
  reply: Reply,
  search: Search,
  share: Share2,
  smartphone: Smartphone,
  star: Star,
  summary: Summary,
  'thumbs-up': ThumbsUp,
  timer: Timer,
  trash: Trash2,
  'triangle-alert': TriangleAlert,
  'triangle-left': TriangleLeft,
  user: UserRound,
  users: Users,
  utensils: Utensils,
  wheat: Wheat,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

type IconProps = Omit<LucideProps, 'ref'> & {
  name: IconName;
  // Có label → icon mang nghĩa (role=img). Không có → Lucide tự đặt aria-hidden.
  label?: string;
};

// Icon nét mảnh theo màu chữ hiện tại (currentColor). Cỡ đặt qua className (mặc định size-5).
export default function Icon({
  name,
  label,
  className,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  const Component = ICONS[name];
  const a11y = label ? { role: 'img', 'aria-label': label } : {};
  return (
    <Component
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className ?? 'size-5')}
      {...a11y}
      {...props}
    />
  );
}
