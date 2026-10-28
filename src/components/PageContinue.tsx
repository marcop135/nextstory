"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageContinue({ children }: { children?: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (pathname === "/" || pathname === "/de") return children;
  return (
    <p className="actions">
      <a className="btn btn--secondary" href="#page-content">
        {pathname.startsWith("/de/") ? "Mehr erfahren" : "Discover more"}
      </a>
    </p>
  );
}
