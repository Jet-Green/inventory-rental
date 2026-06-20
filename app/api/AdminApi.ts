import type {
  IAdminUser,
  IOrganization,
  IRentalListing,
  UserRole,
} from "~/types/rental";

export default {
  async dashboard(): Promise<{
    categoriesCount: number;
    usersCount: number;
    listingsStats: Record<string, number>;
  }> {
    return useNuxtApp().$apiFetch("/admin/dashboard", {
      method: "GET",
    });
  },

  async listings(): Promise<{
    data: IRentalListing[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return useNuxtApp().$apiFetch("/admin/listings", {
      method: "GET",
    });
  },

  /** Одобрить листинг (status=active). */
  async approveListing(id: string): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/admin/listings/${id}/approve`, {
      method: "POST",
    });
  },

  /** Отклонить листинг с причиной (status=rejected). */
  async rejectListing(
    id: string,
    rejectionReason?: string,
  ): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/admin/listings/${id}/reject`, {
      method: "POST",
      body: { rejectionReason },
    });
  },

  /** Скрыть листинг (status=hidden). */
  async hideListing(id: string): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/admin/listings/${id}/hide`, {
      method: "POST",
    });
  },

  async deleteListing(id: string): Promise<{ deleted: boolean }> {
    return useNuxtApp().$apiFetch(`/admin/listings/${id}`, {
      method: "DELETE",
    });
  },

  /** Пользователи с агрегатами и фильтрами по роли/верификации. */
  async users(params?: {
    role?: UserRole;
    verification?: "pending" | "approved" | "rejected" | "none";
  }): Promise<{ users: IAdminUser[]; total: number }> {
    return useNuxtApp().$apiFetch("/admin/users", {
      method: "GET",
      query: params,
    });
  },

  async setUserBlocked(
    id: string,
    isBlocked: boolean,
  ): Promise<{ user: Partial<IAdminUser> }> {
    return useNuxtApp().$apiFetch(`/admin/users/${id}/blocked`, {
      method: "PATCH",
      body: { isBlocked },
    });
  },

  /** Заявки на верификацию организаций (коллекция organizations). */
  async organizationVerificationRequests(): Promise<{
    organizations: IOrganization[];
  }> {
    return useNuxtApp().$apiFetch("/admin/organization-verification-requests", {
      method: "GET",
    });
  },

  async approveOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<{ organization: unknown }> {
    return useNuxtApp().$apiFetch("/admin/organization-verification/approve", {
      method: "POST",
      body: { organizationId, comment },
    });
  },

  async rejectOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<{ organization: unknown }> {
    return useNuxtApp().$apiFetch("/admin/organization-verification/reject", {
      method: "POST",
      body: { organizationId, comment },
    });
  },
};
