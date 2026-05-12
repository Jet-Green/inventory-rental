import type { IBookingItem, IBookingRequest, IBookingResult } from "~/types/rental";

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
};
