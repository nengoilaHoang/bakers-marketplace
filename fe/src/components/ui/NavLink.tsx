import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import React from "react";

const NavLink = ({
  href,
  children,
  className,
  onClick,
  ...others
}: ComponentProps<typeof Link>) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      e.preventDefault();
    }
  };

  return (
    <Link
      {...others}
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={(e) => {
        handleClick(e);
        onClick?.(e);
      }}
      className={`${className ?? ""} ${isActive ? "pointer-events-none" : ""}`.trim()}
    >
      {children}
    </Link>
  );
};

export default NavLink;
