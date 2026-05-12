/**
 * Редирект с /cabinet без рендера «прокладки» в setup — стабильнее для SSR/гидрации.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth();
  const roles = auth.user?.roles || [];
  /* роль бизнеса в JWT/API: lessor */
  if (roles.includes("lessor") || roles.includes("admin")) {
    return navigateTo("/business-cabinet", { replace: true });
  }
  return navigateTo("/renter-cabinet/rentals", { replace: true });
});
