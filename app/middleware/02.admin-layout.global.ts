/** Маршруты /admin/* — только layout админки (без AppHeader и кабинетов). */
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith("/admin")) {
    return;
  }
  setPageLayout("admin");
});
