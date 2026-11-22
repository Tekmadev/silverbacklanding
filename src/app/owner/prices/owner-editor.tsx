"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { parseRating, parseReviewCount } from "@/lib/review-settings";
import type { PromoKey, ServicePricing } from "@/lib/types";

const KEY_STORAGE = "sb_owner_key";

const PROMO_OPTIONS: { value: PromoKey; label: string; hint: string }[] = [
  { value: "black_friday", label: "Black Friday", hint: "PPF + Ceramic deal & free ozone banner" },
  { value: "winter", label: "Winter", hint: "Road salt & rock-chip banner" },
  { value: "none", label: "None", hint: "Hide the banner" },
];

const CATEGORY_LABELS: Record<string, string> = {
  protection: "PPF, ceramic & tint",
  interior: "Interior",
  packages: "Packages",
  addons: "Add-ons",
};

interface EditableRow {
  slug: string;
  name: string;
  category: string;
  display_price: string;
  compare_at_price: string;
  price_cad: string;
  is_active: boolean;
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready" };

function toEditable(s: ServicePricing): EditableRow {
  return {
    slug: s.slug,
    name: s.name,
    category: s.category,
    display_price: s.display_price,
    compare_at_price: s.compare_at_price ?? "",
    price_cad: s.price_cad === null ? "" : String(s.price_cad),
    is_active: s.is_active,
  };
}

interface ReviewFields {
  rating: string;
  count: string;
}

type OwnerDataResult =
  | {
      ok: true;
      services: ServicePricing[];
      promo: PromoKey;
      rating: number;
      reviewCount: number;
      googleLive: boolean;
    }
  | { ok: false; unauthorized: boolean; message: string };

/** Pure network call with no React state, so it is safe to start from an effect. */
async function requestOwnerData(candidate: string): Promise<OwnerDataResult> {
  try {
    const res = await fetch("/api/owner/pricing", {
      headers: { "x-owner-key": candidate },
      cache: "no-store",
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, unauthorized: res.status === 401, message: body.error ?? "Could not load prices." };
    }
    return {
      ok: true,
      services: body.services,
      promo: body.promo,
      rating: body.rating,
      reviewCount: body.reviewCount,
      googleLive: body.googleLive === true,
    };
  } catch {
    return { ok: false, unauthorized: false, message: "Network error. Check your connection and try again." };
  }
}

const rowKey = (r: EditableRow) =>
  `${r.display_price}|${r.compare_at_price}|${r.price_cad}|${r.is_active}`;

export function OwnerEditor() {
  const searchParams = useSearchParams();
  const [key, setKey] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  // Starts in "loading" when a key is already available, so the PIN form never flashes.
  const [load, setLoad] = useState<LoadState>(() =>
    typeof window !== "undefined" && (searchParams.get("key") || sessionStorage.getItem(KEY_STORAGE))
      ? { kind: "loading" }
      : { kind: "idle" },
  );
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState<PromoKey>("none");
  const [originalPromo, setOriginalPromo] = useState<PromoKey>("none");
  const [reviewFields, setReviewFields] = useState<ReviewFields>({ rating: "", count: "" });
  const [originalReviews, setOriginalReviews] = useState<ReviewFields>({ rating: "", count: "" });
  const [googleLive, setGoogleLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const applyResult = useCallback((candidate: string, result: OwnerDataResult) => {
    if (!result.ok) {
      if (result.unauthorized) sessionStorage.removeItem(KEY_STORAGE);
      setKey(result.unauthorized ? null : candidate);
      setLoad({ kind: "error", message: result.message });
      return;
    }
    const editable = result.services.map(toEditable);
    sessionStorage.setItem(KEY_STORAGE, candidate);
    setKey(candidate);
    setRows(editable);
    setOriginal(Object.fromEntries(editable.map((r) => [r.slug, rowKey(r)])));
    setPromo(result.promo);
    setOriginalPromo(result.promo);
    const fields = { rating: Number(result.rating).toFixed(1), count: String(result.reviewCount) };
    setReviewFields(fields);
    setOriginalReviews(fields);
    setGoogleLive(result.googleLive);
    setLoad({ kind: "ready" });
  }, []);

  // Auto-unlock from ?key= (bookmark) or this tab's session.
  useEffect(() => {
    const candidate = searchParams.get("key") || sessionStorage.getItem(KEY_STORAGE);
    if (!candidate) return;
    let cancelled = false;
    requestOwnerData(candidate).then((result) => {
      if (!cancelled) applyResult(candidate, result);
    });
    return () => {
      cancelled = true;
    };
  }, [searchParams, applyResult]);

  const fetchData = useCallback(
    async (candidate: string) => applyResult(candidate, await requestOwnerData(candidate)),
    [applyResult],
  );

  const dirtySlugs = useMemo(
    () => new Set(rows.filter((r) => original[r.slug] !== rowKey(r)).map((r) => r.slug)),
    [rows, original],
  );
  const reviewsDirty =
    reviewFields.rating !== originalReviews.rating || reviewFields.count !== originalReviews.count;
  const isDirty = dirtySlugs.size > 0 || promo !== originalPromo || reviewsDirty;

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function update(slug: string, patch: Partial<EditableRow>) {
    setRows((current) => current.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));
    setNotice(null);
  }

  async function save() {
    if (!key) return;
    const missing = rows.find((r) => !r.display_price.trim());
    if (missing) {
      setNotice({ tone: "error", text: `"${missing.name}" needs a display price.` });
      return;
    }
    const badNumber = rows.find((r) => r.price_cad.trim() && !Number.isFinite(Number(r.price_cad)));
    if (badNumber) {
      setNotice({ tone: "error", text: `"${badNumber.name}" price must be a plain number, e.g. 2499.` });
      return;
    }
    const rating = parseRating(reviewFields.rating);
    if (rating === null) {
      setNotice({ tone: "error", text: "Google rating must be a number from 1.0 to 5.0, e.g. 4.9." });
      return;
    }
    const reviewCount = parseReviewCount(reviewFields.count);
    if (reviewCount === null) {
      setNotice({ tone: "error", text: "Number of reviews must be a whole number of at least 1, e.g. 45." });
      return;
    }

    const sentReviews = reviewFields;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/owner/pricing", {
        method: "POST",
        headers: { "content-type": "application/json", "x-owner-key": key },
        body: JSON.stringify({
          promo,
          rating,
          reviewCount,
          services: rows.map((r) => ({
            slug: r.slug,
            display_price: r.display_price,
            compare_at_price: r.compare_at_price.trim() || null,
            price_cad: r.price_cad.trim() === "" ? null : Number(r.price_cad),
            is_active: r.is_active,
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNotice({ tone: "error", text: body.error ?? "Save failed. Nothing was changed." });
        return;
      }
      setOriginal(Object.fromEntries(rows.map((r) => [r.slug, rowKey(r)])));
      setOriginalPromo(promo);
      // Like prices: only move the "saved" marker, so anything typed during the save stays dirty.
      setOriginalReviews(sentReviews);
      setNotice({ tone: "ok", text: "Saved. The live site shows the changes on the next page load." });
    } catch {
      setNotice({ tone: "error", text: "Network error. Nothing was saved. Try again." });
    } finally {
      setSaving(false);
    }
  }

  function unlock(e: FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoad({ kind: "loading" });
    setNotice(null);
    void fetchData(pin.trim());
  }

  if (load.kind !== "ready") {
    return (
      <form onSubmit={unlock} className="mt-8 max-w-sm space-y-4" aria-describedby="owner-key-status">
        <label htmlFor="owner-key" className="block text-sm font-medium text-silver">
          Owner key
        </label>
        <input
          id="owner-key"
          type="password"
          autoComplete="current-password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-12 w-full rounded-xl border border-steel bg-onyx px-4 text-base text-paper focus:border-paper focus:outline-none"
        />
        <button type="submit" disabled={load.kind === "loading"} className="btn w-full bg-paper text-ink disabled:opacity-50">
          {load.kind === "loading" ? "Checking…" : "Unlock editor"}
        </button>
        <p id="owner-key-status" role="status" className="min-h-5 text-sm text-danger">
          {load.kind === "error" ? load.message : ""}
        </p>
      </form>
    );
  }

  const categories = Array.from(new Set(rows.map((r) => r.category)));

  return (
    <div className="mt-8 space-y-10 pb-32">
      <fieldset className="rounded-2xl border border-line bg-onyx p-5">
        <legend className="eyebrow px-1 text-mist">Promo banner</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PROMO_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-xl border px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-paper ${
                promo === option.value ? "border-paper bg-paper text-ink" : "border-steel text-silver"
              }`}
            >
              <input
                type="radio"
                name="promo"
                value={option.value}
                checked={promo === option.value}
                onChange={() => {
                  setPromo(option.value);
                  setNotice(null);
                }}
                className="sr-only"
              />
              <span className="font-semibold">{option.label}</span>
              <span className={`text-xs ${promo === option.value ? "text-slate" : "text-mist"}`}>{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-line bg-onyx p-5" aria-describedby="reviews-help">
        <legend className="eyebrow px-1 text-mist">Google reviews</legend>
        <p id="reviews-help" className="mt-1 text-sm text-mist">
          {googleLive
            ? "Google is connected, so the site shows the live numbers. These are only used if Google is down."
            : "Copy these from the Google Business Profile. They update the header, hero, reviews section and Google search data."}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-mist">
            Star rating (1.0 to 5.0)
            <input
              value={reviewFields.rating}
              onChange={(e) => {
                setReviewFields((f) => ({ ...f, rating: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") }));
                setNotice(null);
              }}
              inputMode="decimal"
              placeholder="5.0"
              maxLength={3}
              className="tabular mt-1 h-11 w-full rounded-lg border border-steel bg-obsidian px-3 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
            />
          </label>
          <label className="text-xs text-mist">
            Number of reviews
            <input
              value={reviewFields.count}
              onChange={(e) => {
                setReviewFields((f) => ({ ...f, count: e.target.value.replace(/\D/g, "") }));
                setNotice(null);
              }}
              inputMode="numeric"
              placeholder="45"
              maxLength={7}
              className="tabular mt-1 h-11 w-full rounded-lg border border-steel bg-obsidian px-3 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
            />
          </label>
        </div>
      </fieldset>

      {categories.map((category) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="eyebrow text-mist">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <ul className="mt-3 space-y-3">
            {rows
              .filter((r) => r.category === category)
              .map((row) => {
                const dirty = dirtySlugs.has(row.slug);
                return (
                  <li
                    key={row.slug}
                    className={`rounded-2xl border p-4 ${dirty ? "border-paper" : "border-line"} ${row.is_active ? "bg-onyx" : "bg-obsidian opacity-75"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-paper">
                        {row.name}
                        {dirty && <span className="ml-2 text-xs font-medium text-mist">· edited</span>}
                      </h3>
                      <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-sm text-silver">
                        <input
                          type="checkbox"
                          checked={row.is_active}
                          onChange={(e) => update(row.slug, { is_active: e.target.checked })}
                          className="size-5 accent-paper"
                        />
                        Show on site
                      </label>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr_0.8fr]">
                      <label className="text-xs text-mist">
                        Display price
                        <input
                          value={row.display_price}
                          onChange={(e) => update(row.slug, { display_price: e.target.value })}
                          maxLength={60}
                          className="mt-1 h-11 w-full rounded-lg border border-steel bg-obsidian px-3 text-base text-paper focus:border-paper focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-mist">
                        Was / value (optional)
                        <input
                          value={row.compare_at_price}
                          onChange={(e) => update(row.slug, { compare_at_price: e.target.value })}
                          placeholder="e.g. $3,000+"
                          maxLength={40}
                          className="mt-1 h-11 w-full rounded-lg border border-steel bg-obsidian px-3 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-mist">
                        Number for ads ($)
                        <input
                          value={row.price_cad}
                          onChange={(e) => update(row.slug, { price_cad: e.target.value.replace(/[^\d.]/g, "") })}
                          inputMode="decimal"
                          placeholder="2499"
                          className="tabular mt-1 h-11 w-full rounded-lg border border-steel bg-obsidian px-3 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-obsidian/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            role="status"
            aria-live="polite"
            className={`text-sm ${notice?.tone === "error" ? "text-danger" : notice ? "text-whatsapp" : "text-mist"}`}
          >
            {notice?.text ?? (isDirty ? "You have unsaved changes." : "All changes saved.")}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving || !isDirty}
            className="btn bg-paper text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
