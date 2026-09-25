export type DeviceBreakpointWithFluid = 'mobile' | 'tablet' | 'desktop' | 'fluid';
export type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop';

export type BreakpointConfig = {
	label: string;
	width: number | string;
	height?: number;
};

export const BREAKPOINT_PRESETS = {
	mobile: { label: 'Mobile (375px)', width: 375 },
	tablet: { label: 'Tablet (768px)', width: 768 },
	desktop: { label: 'Desktop (1280px)', width: 1280 },
	fluid: { label: 'Fluid', width: '100%' },
};
