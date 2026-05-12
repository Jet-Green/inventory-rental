import RentalApi from "~/api/RentalApi";
import type { IRentalListing } from "~/types/rental";

export function useRentalItem() {
  const currentListing = useState<IRentalListing | null>(
    "rental-current-listing",
    () => null,
  );
  const isLoading = useState<boolean>("rental-current-listing-loading", () => false);

  async function fetchListingById(id: string): Promise<IRentalListing | null> {
    try {
      isLoading.value = true;
      const response = await RentalApi.getById(id);
      currentListing.value = response.listing;
      return response.listing;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    currentListing,
    isLoading,
    fetchListingById,
  };
}
