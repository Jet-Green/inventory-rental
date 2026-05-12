/**
 * Id из Mongo/API может быть строкой, ObjectId ({ toString }), BSON Extended JSON ($oid) или populated-документом.
 */
export function mongoIdToString(id: unknown): string {
  if (id == null || id === "") return "";
  if (typeof id === "string") return id;
  if (typeof id === "number") return String(id);
  if (typeof id === "object" && id !== null) {
    const o = id as Record<string, unknown>;
    if (typeof o.$oid === "string") return o.$oid;
    if (typeof o._id === "string") return o._id;
    const nested = o._id;
    if (typeof nested === "object" && nested !== null) {
      const n = nested as Record<string, unknown>;
      if (typeof n.$oid === "string") return n.$oid;
    }
    const ts = (id as { toString?: () => string }).toString?.();
    if (ts && ts !== "[object Object]") return ts;
  }
  return String(id);
}

/** Короткая подпись для таблиц админки */
export function mongoIdTail(id: unknown, len = 6): string {
  const s = mongoIdToString(id);
  if (!s) return "—";
  return len >= s.length ? s : s.slice(-len);
}

export function mongoIdHead(id: unknown, len = 8): string {
  const s = mongoIdToString(id);
  if (!s) return "—";
  return len >= s.length ? s : s.slice(0, len);
}
