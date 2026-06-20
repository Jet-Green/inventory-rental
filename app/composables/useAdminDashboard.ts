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

  async function fetchOrganizationVerificationRequests(): Promise<void> {
    try {
      isLoading.value = true;
      const requestsData = await AdminApi.organizationVerificationRequests();
      organizationVerificationRequests.value =
        requestsData.organizations || [];
    } finally {
      isLoading.value = false;
    }
  }

  async function approveOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.approveOrganizationVerification(organizationId, comment);
    await fetchOrganizationVerificationRequests();
  }

  async function rejectOrganizationVerification(
    organizationId: string,
    comment = "",
  ): Promise<void> {
    await AdminApi.rejectOrganizationVerification(organizationId, comment);
    await fetchOrganizationVerificationRequests();
  }

  return {
    dashboard,
    listings,
    organizationVerificationRequests,
    isLoading,
    fetchAdminData,
    fetchOrganizationVerificationRequests,
    approveOrganizationVerification,
    rejectOrganizationVerification,
  };
}
