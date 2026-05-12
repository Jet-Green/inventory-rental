import type { IUserProfile } from "~/types/rental";

export interface IUpdateProfilePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  passport?: string;
}

export default {
  async me(): Promise<{ user: IUserProfile | null }> {
    return useNuxtApp().$apiFetch("/user/me", {
      method: "GET",
    });
  },

  async update(payload: IUpdateProfilePayload): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/user/update", {
      method: "POST",
      body: payload,
    });
  },

  async verifyRenter(): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/user/verify-renter", {
      method: "POST",
    });
  },
};
