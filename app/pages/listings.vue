<script setup lang="ts">
import { useRentalCatalog } from "~/composables/useRentalCatalog";

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
  title: "Каталог аренды — gorodaivesi.ru",
  description: "Каталог объявлений аренды оборудования и инвентаря.",
});
</script>

<template>
  <section class="gv-page-wide px-4 px-sm-6 py-8">
    <h1 class="section-title mb-6">Каталог аренды</h1>
    <RentalFilterBar
      v-model="filters"
      :categories="categories"
      :loading="isLoading"
      @apply="applyFilters"
    />
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4 mt-4" />

    <div v-if="isLoading && !items.length" class="card-grid">
      <ListingCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <div v-else-if="items.length" class="card-grid">
      <RentalCard v-for="item in items" :key="item._id" :item="item" to-base="/listings" />
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
        rounded="lg"
        :loading="isLoading"
        @click="loadMore"
      >
        Показать ещё
      </v-btn>
    </div>
  </section>
</template>
