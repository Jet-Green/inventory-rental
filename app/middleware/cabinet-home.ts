/**
 * Редирект с /cabinet без рендера «прокладки» в setup — стабильнее для SSR/гидрации.
 * Кабинет бизнеса — только при одобренной организации (не по roles у user).
 */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  const roles = auth.user?.roles || [];
  if (roles.includes("admin")) {
    return navigateTo("/business-cabinet", { replace: true });
  }

  const { fetchMine } = useMyOrganization();
  await fetchMine();
  const { organization } = useMyOrganization();
  if (organization.value?.moderationStatus === "approved") {
    return navigateTo("/business-cabinet", { replace: true });
  }
  return navigateTo("/renter-cabinet/rentals", { replace: true });
});
