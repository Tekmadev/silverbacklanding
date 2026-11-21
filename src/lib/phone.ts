/**
 * North American (NANP) phone helpers shared by the quote widget and /api/lead.
 * Silverback serves the Hamilton–Halton area, so +1 numbers only.
 */
export function toE164(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  // Area code and exchange both start with 2–9 under NANP rules.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
  return `+1${ten}`;
}

/** "+19055196290" → "(905) 519-6290" */
export function formatPhone(e164: string): string {
  const ten = e164.replace(/\D/g, "").slice(-10);
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}
