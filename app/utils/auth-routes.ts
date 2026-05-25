/** Маршруты, для которых нужна сессия (редирект / toast при 401). */
const PROTECTED_PATH_PREFIXES = [
  "/renter-cabinet",
  "/business-cabinet",
  "/cabinet",
  "/admin",
  "/booking/checkout",
  "/booking/success",
  "/booking/",
] as const;

export function isProtectedRoutePath(path: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isAuthApiUrl(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/registration") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}
