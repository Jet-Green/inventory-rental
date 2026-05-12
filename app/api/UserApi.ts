import type { IUserProfile } from "~/types/rental";

export interface IUpdateProfilePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: "person" | "ip" | "ooo";
  companyName?: string;
  inn?: string;
  ogrnOrOgrnip?: string;
  payoutPhone?: string;
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

  /** Заявка на верификацию бизнеса (эндпоинт бэкенда: verify-lessor). */
  async requestBusinessVerification(): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/user/verify-lessor", {
      method: "POST",
    });
  },

  async verifyRenter(): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/user/verify-renter", {
      method: "POST",
    });
  },
};
