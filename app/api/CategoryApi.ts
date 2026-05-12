import type { ICategory } from "~/types/rental";

export default {
  async getVisible(): Promise<{ categories: ICategory[] }> {
    return useNuxtApp().$apiFetch("/category/visible", {
      method: "GET",
    });
  },
};
