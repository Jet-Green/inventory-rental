import type { IRentalListing, IUserProfile } from "~/types/rental";

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

  /** Список заявок на верификацию бизнеса (путь API: lessor-verification-requests). */
  async businessVerificationRequests(): Promise<{ users: IUserProfile[] }> {
    return useNuxtApp().$apiFetch("/admin/lessor-verification-requests", {
      method: "GET",
    });
  },

  async approveBusinessVerification(
    userId: string,
    comment = "",
  ): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/admin/lessor-verification/approve", {
      method: "POST",
      body: { userId, comment },
    });
  },

  async rejectBusinessVerification(
    userId: string,
    comment = "",
  ): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/admin/lessor-verification/reject", {
      method: "POST",
      body: { userId, comment },
    });
  },
};
