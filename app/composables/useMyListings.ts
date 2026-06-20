import RentalApi from "~/api/RentalApi";
import BookingApi from "~/api/BookingApi";
import type { IRentalListing } from "~/types/rental";

export function useMyListings() {
  const listings = useState<IRentalListing[]>("my-listings", () => []);
  const isLoading = useState<boolean>("my-listings-loading", () => false);
  const actingId = useState<string>("my-listings-acting", () => "");
  /** Кол-во активных броней по объявлению (active|confirmed|pending). */
  const activeBookingsByListing = useState<Record<string, number>>(
    "my-listings-active-bookings",
    () => ({}),
  );

  async function fetchMyListings(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await RentalApi.getMy();
      listings.value = response.listings || [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchActiveBookings(): Promise<void> {
    try {
      const { bookings } = await BookingApi.owner();
      const counts: Record<string, number> = {};
      for (const b of bookings) {
        if (!["pending", "confirmed", "active"].includes(b.status)) continue;
        const listingId =
          typeof b.listingId === "object" && b.listingId
            ? b.listingId._id
            : String(b.listingId || "");
        if (!listingId) continue;
        counts[listingId] = (counts[listingId] || 0) + 1;
      }
      activeBookingsByListing.value = counts;
    } catch {
      activeBookingsByListing.value = {};
    }
  }

  async function submitModeration(id: string): Promise<void> {
    try {
      actingId.value = id;
      await RentalApi.submitModeration(id);
      await fetchMyListings();
    } finally {
      actingId.value = "";
    }
  }

  async function removeListing(id: string): Promise<void> {
    try {
      actingId.value = id;
      await RentalApi.remove(id);
      listings.value = listings.value.filter((l) => l._id !== id);
    } finally {
      actingId.value = "";
    }
  }

  /** Редактирование объявления владельцем. */
  async function updateListing(
    id: string,
    payload: Parameters<typeof RentalApi.update>[1],
  ): Promise<void> {
    try {
      actingId.value = id;
      const { listing } = await RentalApi.update(id, payload);
      const idx = listings.value.findIndex((l) => l._id === id);
      if (idx !== -1 && listing) listings.value[idx] = listing;
    } finally {
      actingId.value = "";
    }
  }

  /** Скрыть/показать объявление. */
  async function setVisibility(id: string, hidden: boolean): Promise<void> {
    try {
      actingId.value = id;
      const { listing } = await RentalApi.setVisibility(id, hidden);
      const idx = listings.value.findIndex((l) => l._id === id);
      if (idx !== -1 && listing) listings.value[idx] = listing;
    } finally {
      actingId.value = "";
    }
  }

  return {
    listings,
    isLoading,
    actingId,
    activeBookingsByListing,
    fetchMyListings,
    fetchActiveBookings,
    submitModeration,
    removeListing,
    updateListing,
    setVisibility,
  };
}
