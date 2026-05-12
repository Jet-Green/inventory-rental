import AdminApi from "~/api/AdminApi";
import type { IOrganization, IRentalListing } from "~/types/rental";

export function useAdminDashboard() {
  const dashboard = useState("admin-dashboard", () => ({
    categoriesCount: 0,
    usersCount: 0,
    listingsStats: {} as Record<string, number>,
  }));
  const listings = useState<IRentalListing[]>("admin-listings", () => []);
  const organizationVerificationRequests = useState<IOrganization[]>(
    "admin-organization-verification-requests",
    () => [],
  );
  const isLoading = useState<boolean>("admin-loading", () => false);

  async function fetchAdminData(): Promise<void> {
    try {
      isLoading.value = true;
      const [dashboardData, listingsData, requestsData] = await Promise.all([
        AdminApi.dashboard(),
        AdminApi.listings(),
        AdminApi.organizationVerificationRequests(),
      ]);
      dashboard.value = dashboardData;
      listings.value = listingsData.data || [];
      organizationVerificationRequests.value =
        requestsData.organizations || [];
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

  async function approveOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.approveOrganizationVerification(organizationId, comment);
    await fetchAdminData();
  }

  async function rejectOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.rejectOrganizationVerification(organizationId, comment);
    await fetchAdminData();
  }

  return {
    dashboard,
    listings,
    organizationVerificationRequests,
    isLoading,
    fetchAdminData,
    moderate,
    approveOrganizationVerification,
    rejectOrganizationVerification,
  };
}
