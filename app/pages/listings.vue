<script setup lang="ts">
import { useRentalCatalog } from "~/composables/useRentalCatalog";

const route = useRoute();
const {
  categories,
  items,
  filters,
  isLoading,
  pagination,
  fetchCategories,
  fetchCatalog,
  loadMore,
} = useRentalCatalog();

onMounted(async () => {
  if (route.params.id) return;
  await fetchCategories();
  await fetchCatalog(filters.value, 1);
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
    <header class="catalog-heading"><div><h1 class="section-title mb-2">Найдите своё снаряжение</h1><p>Выберите даты и инвентарь для ваших планов.</p></div><span aria-live="polite">{{ pagination.total }} объявлений</span></header>
    <div class="catalog-filters"><RentalCatalogFilters
      v-model="filters"
      :categories="categories"
      :loading="isLoading"
      @apply="applyFilters"
    /></div>
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4 mt-4" />

    <div v-if="isLoading && !items.length" class="card-grid">
      <ListingCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <div v-else-if="items.length" class="card-grid">
      <RentalListingCard v-for="item in items" :key="item._id" :item="item" to-base="/listings" />
    </div>

    <EmptyState
      v-else
      title="Ничего не найдено"
      description="Попробуйте изменить категории или диапазон цен."
      action-title="Сбросить фильтры"
      class="mt-4"
      @action="resetListings"
    />
    <div class="d-flex justify-center mt-8">
      <v-btn
        v-if="pagination.page < pagination.totalPages"
        variant="outlined"
        color="primary"
        class="gv-cta"
        :loading="isLoading"
        @click="loadMore"
      >
        Показать ещё
      </v-btn>
    </div>
  </section>
</template>

<style scoped>
.catalog-heading { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }
.catalog-heading p, .catalog-heading > span { color: var(--gv-text-secondary); }
.catalog-heading > span { white-space: nowrap; font-size: 14px; }
.catalog-filters { padding: 22px; background: white; border: 1px solid var(--gv-border-light); border-radius: var(--gv-radius-card); margin-bottom: 28px; }
@media(max-width:599px) { .catalog-filters { padding: 16px; } }
.card-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
</style>
