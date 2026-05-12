import type { UserRole } from "~/types/rental";

export const useRole = () => {
  const auth = useAuth();

  const roles = computed<UserRole[]>(() => auth.user?.roles || []);
  const isRenter = computed(() => roles.value.includes("renter"));
  /** Роль в ответе API: `lessor` — в UI называем «бизнес». */
  const isBusiness = computed(() => roles.value.includes("lessor"));
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
