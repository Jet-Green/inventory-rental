<script setup lang="ts">
defineProps<{ cardBase?: string }>();
defineEmits<{ reset: [] }>();

const { items, appliedFilters, pagination, hasResults, isLoading, failedPage, loadMore, retryCatalog } = useRentalCatalog();
const hasSelection = computed(() =>
  Object.entries(appliedFilters.value).some(([key, value]) =>
    key !== "sortBy" && value != null && String(value).trim() !== ""
  )
);
</script>

<template>
  <div class="catalog-results">
    <p v-if="hasResults" role="status" class="catalog-results__count">Найдено объявлений: {{ pagination.total }}</p>
    <p v-else-if="!failedPage" role="status" class="catalog-results__count">Загружаем объявления…</p>

    <div v-if="!hasResults && !failedPage" class="card-grid" aria-hidden="true">
      <ListingCardSkeleton v-for="i in 6" :key="i" />
    </div>
    <div v-if="items.length" class="card-grid">
      <RentalListingCard v-for="item in items" :key="item._id" :item="item" :to-base="cardBase" />
    </div>
    <div v-if="failedPage !== null" role="alert" class="mt-4">
      <EmptyState
        :title="failedPage > 1 ? 'Не удалось загрузить следующие объявления' : 'Не удалось загрузить объявления'"
        action-title="Повторить загрузку" @action="retryCatalog"
      />
    </div>
    <EmptyState
      v-else-if="hasResults && !items.length"
      :title="hasSelection ? 'По вашему запросу ничего не найдено' : 'Объявлений пока нет'"
      :description="hasSelection ? 'Измените условия поиска или посмотрите все объявления.' : ''"
      :action-title="hasSelection ? 'Показать все объявления' : ''"
      @action="$emit('reset')"
    />
    <div v-else-if="pagination.page < pagination.totalPages" class="d-flex justify-center mt-6">
      <v-btn variant="outlined" class="action-btn" :loading="isLoading" @click="loadMore">Показать ещё объявления</v-btn>
    </div>
  </div>
</template>

<style scoped>
.catalog-results__count { margin: 0 0 14px; font-size: 14px; color: var(--gv-text-secondary); }
.card-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
</style>
