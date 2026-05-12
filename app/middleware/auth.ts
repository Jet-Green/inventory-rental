export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  if (!auth.user?._id) {
    const ok = await auth.checkAuth();
    if (!ok) {
      return navigateTo("/auth");
    }
  }
});
