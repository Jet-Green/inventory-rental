/**
 * Лейаут кабинета по префиксу маршрута: /renter-cabinet vs /business-cabinet.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith("/business-cabinet")) {
    return setPageLayout("business");
  }
  if (to.path.startsWith("/renter-cabinet")) {
    return setPageLayout("renter");
  }
  return setPageLayout("default");
});
