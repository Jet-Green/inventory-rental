import AdminApi from "~/api/AdminApi";
import type { IRentalListing } from "~/types/rental";

export function useAdminModeration() {
  const listings = useState<IRentalListing[]>("admin-moderation-listings", () => []);
  const isLoading = useState<boolean>("admin-moderation-loading", () => false);

  async function fetchListings(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await AdminApi.listings();
      listings.value = response.data || [];
    } finally {
      isLoading.value = false;
    }
  }

  async function approve(id: string): Promise<void> {
    await AdminApi.approveListing(id);
    await fetchListings();
  }

  async function reject(id: string, rejectionReason?: string): Promise<void> {
    await AdminApi.rejectListing(id, rejectionReason);
    await fetchListings();
  }

  async function hide(id: string): Promise<void> {
    await AdminApi.hideListing(id);
    await fetchListings();
  }

  async function remove(id: string): Promise<void> {
    await AdminApi.deleteListing(id);
    await fetchListings();
  }

  return {
    listings,
    isLoading,
    fetchListings,
    approve,
    reject,
    hide,
    remove,
  };
}
