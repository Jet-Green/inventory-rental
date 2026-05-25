import type {
  IBookedRange,
  IBookingItem,
  IBookingRequest,
  IBookingResult,
} from "~/types/rental";

export default {
  async createBooking(payload: IBookingRequest): Promise<IBookingResult> {
    return useNuxtApp().$apiFetch("/booking/create", {
      method: "POST",
      body: payload,
    });
  },

  async my(): Promise<{ bookings: IBookingItem[] }> {
    return useNuxtApp().$apiFetch("/booking/my", {
      method: "GET",
    });
  },

  async busyByListing(listingId: string): Promise<{ busyRanges: IBookedRange[] }> {
    return useNuxtApp().$apiFetch(`/booking/busy/${listingId}`, {
      method: "GET",
    });
  },
};
