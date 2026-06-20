import OrganizationApi from "~/api/OrganizationApi";
import type { IDadataCompany } from "~/types/rental";

export function useDadata() {
  const isLoading = useState<boolean>("dadata-loading", () => false);
  const company = useState<IDadataCompany | null>("dadata-company", () => null);
  const error = useState<string>("dadata-error", () => "");

  /** ИНН валиден, если 10 (юрлицо) или 12 (ИП) цифр. */
  function isValidInn(inn: string): boolean {
    return /^(\d{10}|\d{12})$/.test(inn.trim());
  }

  async function lookup(inn: string): Promise<IDadataCompany | null> {
    error.value = "";
    company.value = null;
    const normalized = inn.trim();
    if (!isValidInn(normalized)) {
      return null;
    }
    try {
      isLoading.value = true;
      const response = await OrganizationApi.dadata(normalized);
      const first = response.companies?.[0] || null;
      if (!first) {
        error.value = "По этому ИНН ничего не найдено.";
        return null;
      }
      company.value = first;
      return first;
    } catch {
      error.value = "Не удалось получить данные по ИНН. Заполните поля вручную.";
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  function reset(): void {
    company.value = null;
    error.value = "";
  }

  return { isLoading, company, error, isValidInn, lookup, reset };
}
