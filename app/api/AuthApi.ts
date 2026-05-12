import type { IUserProfile } from "~/types/rental";

export default {
  async registration(payload: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/auth/registration", {
      method: "POST",
      body: payload,
    });
  },

  async login(email: string, password: string): Promise<{ user: IUserProfile }> {
    return useNuxtApp().$apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  async refresh(): Promise<IUserProfile> {
    return useNuxtApp().$apiFetch("/auth/refresh", {
      method: "GET",
    });
  },

  async logout(): Promise<{ ok: boolean }> {
    return useNuxtApp().$apiFetch("/auth/logout", {
      method: "POST",
    });
  },

  async me(): Promise<{ user: IUserProfile | null }> {
    return useNuxtApp().$apiFetch("/auth/me", {
      method: "GET",
    });
  },
};
