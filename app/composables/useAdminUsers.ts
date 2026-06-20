import AdminApi from "~/api/AdminApi";
import type { IAdminUser, UserRole } from "~/types/rental";

type VerificationFilter = "pending" | "approved" | "rejected" | "none";

export function useAdminUsers() {
  const users = useState<IAdminUser[]>("admin-users", () => []);
  const total = useState<number>("admin-users-total", () => 0);
  const isLoading = useState<boolean>("admin-users-loading", () => false);
  const roleFilter = useState<UserRole | null>("admin-users-role", () => null);
  const verificationFilter = useState<VerificationFilter | null>(
    "admin-users-verification",
    () => null,
  );

  async function fetchUsers(): Promise<void> {
    try {
      isLoading.value = true;
      const params: {
        role?: UserRole;
        verification?: VerificationFilter;
      } = {};
      if (roleFilter.value) params.role = roleFilter.value;
      if (verificationFilter.value) params.verification = verificationFilter.value;
      const response = await AdminApi.users(params);
      users.value = response.users || [];
      total.value = response.total || 0;
    } finally {
      isLoading.value = false;
    }
  }

  async function setBlocked(id: string, isBlocked: boolean): Promise<void> {
    await AdminApi.setUserBlocked(id, isBlocked);
    const target = users.value.find((u) => u.id === id);
    if (target) target.isBlocked = isBlocked;
  }

  return {
    users,
    total,
    isLoading,
    roleFilter,
    verificationFilter,
    fetchUsers,
    setBlocked,
  };
}
