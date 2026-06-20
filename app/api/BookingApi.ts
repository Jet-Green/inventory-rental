import type {
  IBookedRange,
  IBookingItem,
  IBookingRequest,
  IBookingResult,
  IContractsResult,
  IPayResult,
  BookingStatus,
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

  /** Брони по объявлениям текущего арендодателя. */
  async owner(): Promise<{ bookings: IBookingItem[] }> {
    return useNuxtApp().$apiFetch("/booking/owner", {
      method: "GET",
    });
  },

  /** Ручная смена статуса (разрешённые переходы — на стороне backend). */
  async updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<{ booking: IBookingItem }> {
    return useNuxtApp().$apiFetch(`/booking/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  /** Заглушка оплаты: pending → confirmed. */
  async pay(id: string): Promise<IPayResult> {
    return useNuxtApp().$apiFetch(`/booking/${id}/pay`, {
      method: "POST",
    });
  },

  async contracts(id: string): Promise<IContractsResult> {
    return useNuxtApp().$apiFetch(`/booking/${id}/contracts`, {
      method: "GET",
    });
  },

  async busyByListing(listingId: string): Promise<{ busyRanges: IBookedRange[] }> {
    return useNuxtApp().$apiFetch(`/booking/busy/${listingId}`, {
      method: "GET",
    });
  },
};
