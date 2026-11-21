"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { BeforeAfterSet } from "@/config/media";

/** Drag/keyboard comparison slider. Uses clip-path only, so there is no layout shift. */
function Slider({ set }: { set: BeforeAfterSet }) {
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <figure className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-line bg-graphite select-none"
        style={{ aspectRatio: `${set.after.width} / ${set.after.height}` }}
      >
        <Image
          src={set.before.src}
          alt={set.before.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <Image
            src={set.after.src}
            alt={set.after.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-paper shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink">
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </span>
        </div>
        <span className="eyebrow absolute top-3 left-3 rounded-full bg-obsidian/85 px-2.5 py-1 text-paper" aria-hidden="true">
          Before
        </span>
        <span className="eyebrow absolute top-3 right-3 rounded-full bg-paper/90 px-2.5 py-1 text-ink" aria-hidden="true">
          After
        </span>
        <label htmlFor={id} className="sr-only">
          {`Compare before and after: ${set.title}`}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="text-sm font-semibold text-silver">{set.title}</figcaption>
    </figure>
  );
}

export function BeforeAfterGrid({ sets }: { sets: BeforeAfterSet[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sets.map((set) => (
        <Slider key={set.id} set={set} />
      ))}
    </div>
  );
}
