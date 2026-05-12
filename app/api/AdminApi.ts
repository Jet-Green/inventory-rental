import type { IOrganization, IRentalListing } from "~/types/rental";

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

  async moderate(
    listingId: string,
    status: "active" | "pending" | "rejected" | "hidden",
  ): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch("/rental-listing/moderation", {
      method: "POST",
      body: { listingId, status },
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
