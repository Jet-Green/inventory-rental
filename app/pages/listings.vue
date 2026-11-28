<script setup lang="ts">
import { useRentalCatalog } from "~/composables/useRentalCatalog";

const route = useRoute();
const {
  categories,
  filters,
  isLoading,
  fetchCategories,
  categoriesFailed,
  fetchCatalog,
} = useRentalCatalog();

onMounted(async () => {
  if (route.params.id) return;
  await Promise.all([fetchCategories(), fetchCatalog(filters.value, 1)]);
});

async function applyFilters(): Promise<void> {
  await fetchCatalog(filters.value, 1);
}

async function resetListings(): Promise<void> {
  filters.value = {};
  await applyFilters();
}

useSeoMeta({
  title: "Каталог аренды — Аренда инвентаря",
  description: "Каталог объявлений аренды оборудования и инвентаря.",
});
</script>

<template>
  <NuxtPage v-if="route.params.id" />
  <section v-else class="gv-page-wide px-4 px-sm-6 py-8">
    <header class="catalog-heading"><div><h1 class="section-title mb-2">Найдите своё снаряжение</h1><p>Выберите даты и инвентарь для ваших планов.</p></div></header>
    <div class="catalog-filters"><RentalCatalogFilters
      v-model="filters"
      :categories="categories"
      :categories-failed="categoriesFailed"
      @retry-categories="fetchCategories"
      :loading="isLoading"
      @apply="applyFilters"
    /></div>
    <RentalCatalogResults card-base="/listings" @reset="resetListings" />
  </section>
</template>

<style scoped>
.catalog-heading { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }
.catalog-heading p, .catalog-heading > span { color: var(--gv-text-secondary); }
.catalog-heading > span { white-space: nowrap; font-size: 14px; }
.catalog-filters { padding: 22px; background: white; border: 1px solid var(--gv-border-light); border-radius: var(--gv-radius-card); margin-bottom: 28px; }
@media(max-width:599px) { .catalog-filters { padding: 16px; } }
</style>
