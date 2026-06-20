import type {
  ICatalogFilters,
  IPaginatedResponse,
  IRentalListing,
} from "~/types/rental";

export default {
  async create(payload: {
    title: string;
    description: string;
    categories: string[];
    photos: string[];
    pricePerDay: number;
    minDays: number;
    unitsTotal: number;
    pickupType: "pickup" | "delivery" | "both";
    pickupAddress?: string;
    deliveryZone?: string;
    calendar?: Array<{ from: string; to: string }>;
  }): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch("/rental-listing/create", {
      method: "POST",
      body: payload,
    });
  },

  async getCatalog(
    filters: ICatalogFilters = {},
    page = 1,
    limit = 12,
  ): Promise<IPaginatedResponse<IRentalListing>> {
    return useNuxtApp().$apiFetch("/rental-listing/catalog", {
      method: "POST",
      body: { filters, page, limit },
    });
  },

  async getById(id: string): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/rental-listing/${id}`, {
      method: "GET",
    });
  },

  async getMy(): Promise<{ listings: IRentalListing[] }> {
    return useNuxtApp().$apiFetch("/rental-listing/my", {
      method: "GET",
    });
  },

  /** Перевод draft|rejected → pending (отправка на повторную модерацию). */
  async submitModeration(id: string): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/rental-listing/${id}/submit-moderation`, {
      method: "POST",
    });
  },

  /** Частичное редактирование объявления владельцем. */
  async update(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      categories: string[];
      photos: string[];
      pricePerDay: number;
      minDays: number;
      unitsTotal: number;
      pickupType: "pickup" | "delivery" | "both";
      pickupAddress: string;
      deliveryZone: string;
      calendar: Array<{ from: string; to: string }>;
    }>,
  ): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/rental-listing/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  /** Скрыть (active→hidden) / показать (hidden→active) объявление. */
  async setVisibility(
    id: string,
    hidden: boolean,
  ): Promise<{ listing: IRentalListing }> {
    return useNuxtApp().$apiFetch(`/rental-listing/${id}/visibility`, {
      method: "POST",
      body: { hidden },
    });
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    return useNuxtApp().$apiFetch(`/rental-listing/${id}`, {
      method: "DELETE",
    });
  },
};
