import BookingApi from "~/api/BookingApi";
import type { IBookingItem } from "~/types/rental";

export function useMyBookings() {
  const bookings = useState<IBookingItem[]>("my-bookings", () => []);
  const isLoading = useState<boolean>("my-bookings-loading", () => false);

  async function fetchMyBookings(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await BookingApi.my();
      bookings.value = response.bookings || [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    bookings,
    isLoading,
    fetchMyBookings,
  };
}
