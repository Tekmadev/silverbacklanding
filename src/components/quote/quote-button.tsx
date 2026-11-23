"use client";

import type { ReactNode } from "react";
import { SELECT_SERVICE_EVENT, type SelectServiceDetail } from "@/config/quote";

/**
 * Scrolls to the quote widget and selects a service chip.
 * `add` marks an upsell ("Add tint") that joins the current selection instead of replacing
 * the page's pre-ticked default.
 */
export function QuoteButton({
  slug,
  add,
  className,
  children,
}: {
  slug?: string;
  add?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#quote"
      className={className}
      onClick={() => {
        if (slug) {
          const detail: SelectServiceDetail = { slug, add };
          window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail }));
        }
      }}
    >
      {children}
    </a>
  );
}
