/**
 * Доступ к кабинету бизнеса: одобренная организация текущего пользователя
 * (менеджер в orgManagers + moderationStatus === approved), не поле roles у user.
 */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  if (!auth.user?._id) {
    const ok = await auth.checkAuth();
    if (!ok) {
      return navigateTo({ path: "/auth", query: { businessNeedAuth: "1" } });
    }
  }
  const roles = auth.user?.roles || [];
  if (roles.includes("admin")) {
    return;
  }

  const { fetchMine } = useMyOrganization();
  await fetchMine();
  const { organization } = useMyOrganization();
  if (organization.value?.moderationStatus === "approved") {
    return;
  }

  if (roles.includes("renter")) {
    return navigateTo({
      path: "/business-cabinet/verification",
      query: { needBusinessVerification: "1" },
    });
  }

  return navigateTo({
    path: "/renter-cabinet/rentals",
    query: { openCabinetSelect: "1", businessAccessDenied: "1" },
  });
});
