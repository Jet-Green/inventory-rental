import type { ICategory, ICategoryFull } from "~/types/rental";

export interface ICategoryCreatePayload {
  key: string;
  name: string;
  isVisible?: boolean;
  icon?: string;
  order?: number;
}

export interface ICategoryUpdatePayload {
  name?: string;
  icon?: string;
  order?: number;
  isVisible?: boolean;
}

export default {
  async getVisible(): Promise<{ categories: ICategory[] }> {
    return useNuxtApp().$apiFetch("/category/visible", {
      method: "GET",
    });
  },

  /** Все категории, включая скрытые (для админ-таблицы). */
  async getAll(): Promise<{ categories: ICategoryFull[] }> {
    return useNuxtApp().$apiFetch("/category/all", {
      method: "GET",
    });
  },

  async create(
    payload: ICategoryCreatePayload,
  ): Promise<{ category: ICategoryFull }> {
    return useNuxtApp().$apiFetch("/category/create", {
      method: "POST",
      body: payload,
    });
  },

  async update(
    id: string,
    payload: ICategoryUpdatePayload,
  ): Promise<{ category: ICategoryFull }> {
    return useNuxtApp().$apiFetch(`/category/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  /** Переключение видимости; без тела — инверсия на стороне backend. */
  async toggleVisibility(
    id: string,
    isVisible?: boolean,
  ): Promise<{ category: ICategoryFull }> {
    return useNuxtApp().$apiFetch(`/category/${id}/visibility`, {
      method: "PATCH",
      body: typeof isVisible === "boolean" ? { isVisible } : {},
    });
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    return useNuxtApp().$apiFetch(`/category/${id}`, {
      method: "DELETE",
    });
  },
};
