import CategoryApi from "~/api/CategoryApi";
import RentalApi from "~/api/RentalApi";
import type {
  ICategory,
  ICatalogFilters,
  IRentalListing,
} from "~/types/rental";

export function useRentalCatalog() {
  const items = useState<IRentalListing[]>("rental-items", () => []);
  const categories = useState<ICategory[]>("rental-categories", () => []);
  const filters = useState<ICatalogFilters>("rental-filters", () => ({}));
  const pagination = useState("rental-pagination", () => ({
    page: 1,
    total: 0,
    totalPages: 0,
  }));
  const isLoading = useState<boolean>("rental-loading", () => false);

  async function fetchCategories(): Promise<void> {
    const response = await CategoryApi.getVisible();
    categories.value = response.categories ?? [];
  }

  async function fetchCatalog(
    nextFilters: ICatalogFilters = filters.value,
    page = 1,
  ): Promise<void> {
    try {
      isLoading.value = true;
      filters.value = { ...nextFilters };
      const response = await RentalApi.getCatalog(nextFilters, page);
      if (page === 1) {
        items.value = response.data;
      } else {
        items.value = [...items.value, ...response.data];
      }
      pagination.value = {
        page: response.page,
        total: response.total,
        totalPages: response.totalPages,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (
      isLoading.value ||
      pagination.value.page >= pagination.value.totalPages
    ) {
      return;
    }
    await fetchCatalog(filters.value, pagination.value.page + 1);
  }

  return {
    items,
    categories,
    filters,
    pagination,
    isLoading,
    fetchCategories,
    fetchCatalog,
    loadMore,
  };
}
