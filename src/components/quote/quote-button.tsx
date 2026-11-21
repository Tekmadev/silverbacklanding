"use client";

import type { ReactNode } from "react";
import { SELECT_SERVICE_EVENT } from "@/config/quote";

/** Scrolls to the quote widget and preselects a service chip. */
export function QuoteButton({
  slug,
  className,
  children,
}: {
  slug?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#quote"
      className={className}
      onClick={() => {
        if (slug) window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: slug }));
      }}
    >
      {children}
    </a>
  );
}
