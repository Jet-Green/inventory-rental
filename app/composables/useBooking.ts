import BookingApi from "~/api/BookingApi";
import type {
  IBookingRequest,
  IBookingResult,
  IContractsResult,
} from "~/types/rental";

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

  /** Заглушка оплаты: pending → confirmed (реальный эквайринг позже). */
  async function payBooking(bookingId: string): Promise<void> {
    await BookingApi.pay(bookingId);
    if (lastBooking.value?.bookingId === bookingId) {
      lastBooking.value = { ...lastBooking.value, status: "confirmed" };
    }
  }

  async function fetchContracts(bookingId: string): Promise<IContractsResult> {
    return BookingApi.contracts(bookingId);
  }

  return {
    isSubmitting,
    lastBooking,
    createBooking,
    payBooking,
    fetchContracts,
  };
}
