import AdminApi from "~/api/AdminApi";
import type { IRentalListing, IUserProfile } from "~/types/rental";

export function useAdminDashboard() {
  const dashboard = useState("admin-dashboard", () => ({
    categoriesCount: 0,
    usersCount: 0,
    listingsStats: {} as Record<string, number>,
  }));
  const listings = useState<IRentalListing[]>("admin-listings", () => []);
  const businessVerificationRequests = useState<IUserProfile[]>(
    "admin-business-verification-requests",
    () => [],
  );
  const isLoading = useState<boolean>("admin-loading", () => false);

  async function fetchAdminData(): Promise<void> {
    try {
      isLoading.value = true;
      const [dashboardData, listingsData, requestsData] = await Promise.all([
        AdminApi.dashboard(),
        AdminApi.listings(),
        AdminApi.businessVerificationRequests(),
      ]);
      dashboard.value = dashboardData;
      listings.value = listingsData.data || [];
      businessVerificationRequests.value = requestsData.users || [];
    } finally {
      isLoading.value = false;
    }
  }

  async function moderate(
    listingId: string,
    status: "active" | "pending" | "rejected" | "hidden",
  ): Promise<void> {
    await AdminApi.moderate(listingId, status);
    await fetchAdminData();
  }

  async function approveBusinessVerification(
    userId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.approveBusinessVerification(userId, comment);
    await fetchAdminData();
  }

  async function rejectBusinessVerification(
    userId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.rejectBusinessVerification(userId, comment);
    await fetchAdminData();
  }

  return {
    dashboard,
    listings,
    businessVerificationRequests,
    isLoading,
    fetchAdminData,
    moderate,
    approveBusinessVerification,
    rejectBusinessVerification,
  };
}
