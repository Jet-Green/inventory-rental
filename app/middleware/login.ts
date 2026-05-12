export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  if (!auth.user?._id) {
    await auth.checkAuth();
  }
  if (auth.user?._id) {
    return navigateTo("/cabinet");
  }
});
