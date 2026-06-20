import BookingApi from "~/api/BookingApi";
import type { BookingStatus, IBookingItem } from "~/types/rental";

export function useOwnerBookings() {
  const bookings = useState<IBookingItem[]>("owner-bookings", () => []);
  const isLoading = useState<boolean>("owner-bookings-loading", () => false);
  const updatingId = useState<string>("owner-bookings-updating", () => "");

  async function fetchOwnerBookings(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await BookingApi.owner();
      bookings.value = response.bookings || [];
    } finally {
      isLoading.value = false;
    }
  }

  /** Ручная смена статуса арендодателем (по разрешённым переходам backend). */
  async function changeStatus(id: string, status: BookingStatus): Promise<void> {
    try {
      updatingId.value = id;
      const { booking } = await BookingApi.updateStatus(id, status);
      const idx = bookings.value.findIndex((b) => b._id === id);
      if (idx !== -1 && booking) bookings.value[idx] = booking;
    } finally {
      updatingId.value = "";
    }
  }

  return { bookings, isLoading, updatingId, fetchOwnerBookings, changeStatus };
}
