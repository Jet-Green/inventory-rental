import { rentalReturnPath } from "~/utils/rentalHandoff";
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  if (!auth.user?._id) {
    await auth.checkAuth();
  }
  if (auth.user?._id) {
    const target = to.query.returnTo;
    return navigateTo(rentalReturnPath(target));
  }
});
