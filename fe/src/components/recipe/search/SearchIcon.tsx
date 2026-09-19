import type { ReactNode } from "react";

type IconName = "search" | "tool" | "ingredient" | "chevron" | "close" | "help";

const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4 4" /></>,
  tool: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 8h16M8 5.5h.01M12 5.5h.01M16 5.5h.01" /><rect x="7" y="11" width="10" height="7" rx="1" /></>,
  ingredient: <><path d="M4 10h16a8 8 0 0 1-16 0ZM8 21h8M8 3v3M12 3v3M16 3v3" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.8-2.5 2-2.5 4M12 16.5h.01" /></>,
};

export default function SearchIcon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  );
}
