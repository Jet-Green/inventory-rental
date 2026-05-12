import BookingApi from "~/api/BookingApi";
import type { IBookingRequest, IBookingResult } from "~/types/rental";

export function useBooking() {
  const isSubmitting = useState<boolean>("booking-submitting", () => false);
  const lastBooking = useState<IBookingResult | null>("last-booking", () => null);

  async function createBooking(payload: IBookingRequest): Promise<IBookingResult> {
    try {
      isSubmitting.value = true;
      const response = await BookingApi.createBooking(payload);
      lastBooking.value = response;
      return response;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    lastBooking,
    createBooking,
  };
}
