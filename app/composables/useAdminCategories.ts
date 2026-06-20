import CategoryApi, {
  type ICategoryCreatePayload,
  type ICategoryUpdatePayload,
} from "~/api/CategoryApi";
import type { ICategoryFull } from "~/types/rental";

export function useAdminCategories() {
  const categories = useState<ICategoryFull[]>("admin-categories", () => []);
  const isLoading = useState<boolean>("admin-categories-loading", () => false);

  async function fetchCategories(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await CategoryApi.getAll();
      categories.value = response.categories || [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createCategory(payload: ICategoryCreatePayload): Promise<void> {
    await CategoryApi.create(payload);
    await fetchCategories();
  }

  async function updateCategory(
    id: string,
    payload: ICategoryUpdatePayload,
  ): Promise<void> {
    await CategoryApi.update(id, payload);
    await fetchCategories();
  }

  async function toggleVisibility(id: string, isVisible?: boolean): Promise<void> {
    await CategoryApi.toggleVisibility(id, isVisible);
    await fetchCategories();
  }

  async function removeCategory(id: string): Promise<void> {
    await CategoryApi.remove(id);
    await fetchCategories();
  }

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleVisibility,
    removeCategory,
  };
}
