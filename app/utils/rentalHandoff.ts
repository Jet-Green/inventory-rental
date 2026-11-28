export function rentalHandoffQuery(input: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  const validDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (validDate(input.dateFrom) && validDate(input.dateTo) && input.dateTo > input.dateFrom) {
    result.dateFrom = input.dateFrom; result.dateTo = input.dateTo;
  }
  if (typeof input.unitsNeeded === "string" && /^[1-9]\d{0,4}$/.test(input.unitsNeeded) && Number(input.unitsNeeded) <= 10000) result.unitsNeeded = input.unitsNeeded;
  return result;
}
export function rentalReturnPath(value: unknown): string {
  if (value === "/business-cabinet/listings/new") return value;
  if (typeof value === "string" && /^\/federation\/authorize\?state=[a-f0-9]{64}$/.test(value)) return value;
  if (typeof value !== "string" || !/^\/rental-item\/[a-f0-9]{24}(?:\?|$)/.test(value)) return "/cabinet";
  const url = new URL(value, "https://rent.gorodaivesi.ru");
  if (!/^\/rental-item\/[a-f0-9]{24}$/.test(url.pathname)) return "/cabinet";
  const query = new URLSearchParams(rentalHandoffQuery(Object.fromEntries(url.searchParams))).toString();
  return url.pathname + (query ? `?${query}` : "");
}
