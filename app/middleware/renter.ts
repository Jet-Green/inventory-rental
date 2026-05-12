export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  if (!auth.user?._id) {
    const ok = await auth.checkAuth();
    if (!ok) return navigateTo("/auth");
  }
  const roles = auth.user?.roles || [];
  if (!roles.includes("renter") && !roles.includes("admin")) {
    return navigateTo({
      path: "/renter-cabinet/rentals",
      query: { openCabinetSelect: "1" },
    });
  }
});
