import type { UserRole } from "~/types/rental";

export const useRole = () => {
  const auth = useAuth();
  const { organization } = useMyOrganization();

  const roles = computed<UserRole[]>(() => auth.user?.roles || []);
  const isRenter = computed(() => roles.value.includes("renter"));
  /**
   * Доступ к функциям бизнеса: одобренная организация (не roles `business`/`lessor`).
   * Админ обходится отдельно — у него может не быть записи organization.
   */
  const isBusiness = computed(
    () =>
      roles.value.includes("admin") ||
      organization.value?.moderationStatus === "approved",
  );
  const isAdmin = computed(() => roles.value.includes("admin"));
  const isAuth = computed(() => !!auth.user?._id);

  return {
    roles,
    isAuth,
    isRenter,
    isBusiness,
    isAdmin,
  };
};
