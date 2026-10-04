import { Be_Vietnam_Pro, Play, Playfair_Display } from 'next/font/google';

// Font chữ thân (thay Poppins của template vì Poppins không có dấu tiếng Việt).
export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Font tiêu đề section (serif).
export const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

// Font logo chữ.
export const play = Play({
  subsets: ['latin', 'vietnamese'],
  weight: '700',
  display: 'swap',
});
