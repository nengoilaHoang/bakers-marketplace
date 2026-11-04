type ClassValue = string | false | null | undefined;

// Nối className, bỏ qua giá trị rỗng/false.
export function cn(...classes: ClassValue[]) {
  const classSet = new Set<string>(
    classes.flatMap((className) =>
      typeof className === 'string'
        ? className.trim().split(/\s+/).filter(Boolean)
        : [],
    ),
  );
  return [...classSet].filter(Boolean).join(' ');
}
