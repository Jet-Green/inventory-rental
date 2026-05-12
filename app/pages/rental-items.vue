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
</script>

<template>
  <section class="page-container py-6">
    <h1 class="section-title mb-4">Каталог аренды</h1>
    <RentalFilterBar
      v-model="filters"
      :categories="categories"
      :loading="isLoading"
      @apply="applyFilters"
    />
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div v-if="isLoading && !items.length" class="card-grid">
      <ListingCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <div v-else-if="items.length" class="card-grid">
      <RentalCard v-for="item in items" :key="item._id" :item="item" />
    </div>

    <EmptyState
      v-else
      title="Ничего не найдено"
      description="Попробуйте изменить категории или диапазон цен."
      action-title="Сбросить фильтры"
      class="mt-4"
      @action="filters = {}"
    />
    <div class="d-flex justify-center mt-6">
      <v-btn
        v-if="pagination.page < pagination.totalPages"
        class="action-btn"
        variant="outlined"
        :loading="isLoading"
        @click="loadMore"
      >
        Показать еще
      </v-btn>
    </div>
  </section>
</template>
