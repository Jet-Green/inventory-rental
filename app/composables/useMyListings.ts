import RentalApi from "~/api/RentalApi";
import type { IRentalListing } from "~/types/rental";

export function useMyListings() {
  const listings = useState<IRentalListing[]>("my-listings", () => []);
  const isLoading = useState<boolean>("my-listings-loading", () => false);

  async function fetchMyListings(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await RentalApi.getMy();
      listings.value = response.listings || [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    listings,
    isLoading,
    fetchMyListings,
  };
}
