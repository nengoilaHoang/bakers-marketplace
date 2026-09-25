const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 72;

export const parseAllowedFontSize = (input: string): string => {
	const match = /^(\d+(?:\.\d+)?)px$/.exec(input);
	if (match) {
		const n = Number(match[1]);
		if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
			return input;
		}
	}
	return '';
};

export function parseAllowedColor(input: string) {
	return /^rgb\(\d+, \d+, \d+\)$/.test(input) ? input : '';
}
