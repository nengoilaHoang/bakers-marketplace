type ClassValue = string | false | null | undefined;

// Nối className, bỏ qua giá trị rỗng/false.
export function cn(...classes: ClassValue[]) {
  const classSet = new Set<string>(
    classes.flatMap((className) =>
      typeof className === 'string' ? className.trim().split(' ') : '',
    ),
  );
  return [...classSet].filter(Boolean).join(' ');
}
