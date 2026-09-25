import React, { useEffect, useRef, useState } from "react";
import NavLink from "./NavLink";

type AvatarMenuProps = Readonly<{
  actions: ReadonlyArray<{
    label: string;
    href: string;
    callbackFn?: () => void;
  }>;
}>;

export default function AvatarMenu({ actions }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeWhenClickingOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (actions.length === 0 || isOpen) e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open Account Options"
        className={`flex size-9 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 ${
          actions.length === 0 || isOpen
            ? "pointer-events-none"
            : "hover:bg-zinc-700"
        }`}
      >
        U
      </button>

      {actions.length > 0 && isOpen && (
        <div
          role="menu"
          aria-label="Account Option"
          className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg overflow-hidden"
        >
          {actions.map((action) => (
            <NavLink
              key={`${action.href}-${action.label}`}
              href={action.href}
              role="menuitem"
              className="block px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 focus-visible:outline-none"
              onClick={() => {
                action.callbackFn?.();
                setIsOpen(false);
              }}
            >
              {action.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
