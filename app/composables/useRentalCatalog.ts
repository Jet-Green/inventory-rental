import CategoryApi from "~/api/CategoryApi";
import RentalApi from "~/api/RentalApi";
import type { ICategory, ICatalogFilters, IRentalListing } from "~/types/rental";

export function useRentalCatalog() {
  const items = useState<IRentalListing[]>("rental-items", () => []);
  const categories = useState<ICategory[]>("rental-categories", () => []);
  const filters = useState<ICatalogFilters>("rental-filters", () => ({}));
  const appliedFilters = useState<ICatalogFilters>("rental-applied-filters", () => ({}));
  const pagination = useState("rental-pagination", () => ({ page: 1, total: 0, totalPages: 0 }));
  const isLoading = useState<boolean>("rental-loading", () => false);
  const hasResults = useState<boolean>("rental-results-loaded", () => false);
  const failedPage = useState<number | null>("rental-failed-page", () => null);
  const categoriesFailed = useState<boolean>("rental-categories-error", () => false);
  const requestId = useState<number>("rental-search-request", () => 0);

  async function fetchCategories(): Promise<void> {
    try {
      const response = await CategoryApi.getVisible();
      categories.value = response.categories ?? [];
      categoriesFailed.value = false;
    } catch {
      categoriesFailed.value = true;
    }
  }

  async function fetchCatalog(nextFilters: ICatalogFilters = filters.value, page = 1): Promise<void> {
    const request = ++requestId.value;
    if (page === 1) {
      if (nextFilters !== appliedFilters.value) filters.value = { ...nextFilters };
      appliedFilters.value = { ...nextFilters };
      hasResults.value = false;
      items.value = [];
      pagination.value = { page: 1, total: 0, totalPages: 0 };
    }
    isLoading.value = true;
    failedPage.value = null;
    try {
      const response = await RentalApi.getCatalog(nextFilters, page);
      if (request !== requestId.value) return;
      items.value = page === 1 ? response.data : [...items.value, ...response.data];
      pagination.value = { page: response.page, total: response.total, totalPages: response.totalPages };
      hasResults.value = true;
    } catch {
      if (request === requestId.value) failedPage.value = page;
    } finally {
      if (request === requestId.value) isLoading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!isLoading.value && pagination.value.page < pagination.value.totalPages) {
      await fetchCatalog(appliedFilters.value, pagination.value.page + 1);
    }
  }

  function retryCatalog() {
    if (failedPage.value !== null) return fetchCatalog(appliedFilters.value, failedPage.value);
  }

  return {
    items, categories, filters, appliedFilters, pagination, isLoading, hasResults, failedPage,
    categoriesFailed, fetchCategories, fetchCatalog, loadMore, retryCatalog,
  };
}
