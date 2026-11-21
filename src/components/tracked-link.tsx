"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackCallClick, trackDirectionsClick, trackWhatsAppDirectClick } from "@/lib/tracking";

type Kind = "call" | "whatsapp" | "directions";

const TRACKERS: Record<Kind, (location: string) => void> = {
  call: trackCallClick,
  whatsapp: trackWhatsAppDirectClick,
  directions: trackDirectionsClick,
};

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  kind: Kind;
  /** Where on the page this button lives, e.g. "header", "hero", "mobile_sticky". */
  location: string;
  href: string;
  children: ReactNode;
}

/** Anchor that fires Supabase + GTM + Pixel tracking on tap without delaying navigation. */
export function TrackedLink({ kind, location, onClick, children, ...props }: TrackedLinkProps) {
  const external = kind !== "call";
  return (
    <a
      {...props}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={(event) => {
        TRACKERS[kind](location);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
