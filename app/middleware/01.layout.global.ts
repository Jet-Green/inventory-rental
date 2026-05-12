export default defineNuxtRouteMiddleware((to) => {
  if (
    to.path.startsWith("/renter-cabinet") ||
    to.path.startsWith("/business-cabinet")
  ) {
    return;
  }

  if (typeof to.meta.layout === "string") {
    return setPageLayout(to.meta.layout);
  }

  return setPageLayout("default");
});
