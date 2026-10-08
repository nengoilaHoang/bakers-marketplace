type ClassValue = string | false | null | undefined;

// Nối className, bỏ qua giá trị rỗng/false.
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}
