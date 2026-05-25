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

const searchLocal = ref("");

onMounted(async () => {
  await fetchCategories();
  await fetchCatalog({}, 1);
});

watch(
  () => filters.value.search,
  (v) => {
    searchLocal.value = v || "";
  },
  { immediate: true },
);

const quickTags = computed(() => {
  const preferred = ["sport", "kids", "ovz", "hike", "travel"];
  const list = categories.value || [];
  const byKey = new Map(list.map((c) => [c.key, c]));
  const out: { key: string; label: string }[] = [];
  for (const key of preferred) {
    const c = byKey.get(key);
    if (c) out.push({ key: c.key, label: c.name });
  }
  for (const c of list) {
    if (out.length >= 4) break;
    if (!out.some((x) => x.key === c.key)) {
      out.push({ key: c.key, label: c.name });
    }
  }
  return out.slice(0, 4);
});

const activeQuickKey = ref<string | null>(null);
const filtersDialogOpen = ref(false);

const activeFiltersCount = computed(() => {
  const f = filters.value;
  let n = 0;
  if (f.dateFrom || f.dateTo) n += 1;
  if (f.pickupType) n += 1;
  if (f.sortBy) n += 1;
  if (f.categories?.length) n += 1;
  return n;
});

async function applySearch(): Promise<void> {
  await fetchCatalog({ ...filters.value, search: searchLocal.value || undefined }, 1);
}

async function applyFiltersFromDialog(): Promise<void> {
  filtersDialogOpen.value = false;
  await applySearch();
}

async function clearFiltersInDialog(): Promise<void> {
  const search = filters.value.search;
  filters.value = search ? { search } : {};
  activeQuickKey.value = null;
}

async function toggleQuickCategory(key: string): Promise<void> {
  if (activeQuickKey.value === key) {
    activeQuickKey.value = null;
    await fetchCatalog({ ...filters.value, categories: undefined }, 1);
    return;
  }
  activeQuickKey.value = key;
  await fetchCatalog({ ...filters.value, categories: [key] }, 1);
}

async function resetCatalog(): Promise<void> {
  activeQuickKey.value = null;
  filters.value = {};
  searchLocal.value = "";
  await fetchCatalog({}, 1);
}

useSeoMeta({
  title: "gorodaivesi.ru — аренда оборудования",
  description: "Единый каталог аренды на gorodaivesi.ru",
});
</script>

<template>
  <div class="home-catalog">
    <section class="gv-page-wide px-4 px-sm-6 pb-12 pt-8">
      <h1 class="home-catalog__hero gv-display mb-3">
        Найдите оборудование для отдыха и спорта
      </h1>
      <p class="home-catalog__lead mb-6">
        Единый каталог аренды на gorodaivesi.ru
      </p>

      <div class="d-flex flex-column flex-md-row gap-3 mb-6 align-stretch">
        <v-text-field
          v-model="searchLocal"
          placeholder="Поиск по названию или категории…"
          variant="outlined"
          density="comfortable"
          hide-details
          class="home-catalog__search flex-grow-1"
          rounded="lg"
          @keyup.enter="applySearch"
        />
        <div class="d-flex gap-3 flex-shrink-0">
          <v-btn
            color="primary"
            class="gv-cta"
            height="48"
            min-width="100"
            @click="applySearch"
          >
            Найти
          </v-btn>
          <v-badge
            :content="activeFiltersCount"
            :model-value="activeFiltersCount > 0"
            color="primary"
          >
            <v-btn
              variant="outlined"
              color="primary"
              class="gv-cta"
              height="48"
              min-width="120"
              @click="filtersDialogOpen = true"
            >
              Фильтры
            </v-btn>
          </v-badge>
        </div>
      </div>

      <v-dialog v-model="filtersDialogOpen" max-width="720" scrollable>
        <v-card rounded="xl" class="pa-1">
          <v-card-title class="text-h6 font-weight-semibold pa-4 pb-2">
            Фильтры
          </v-card-title>
          <v-card-text class="pa-4 pt-2">
            <RentalFilterBar
              v-model="filters"
              :categories="categories"
              :loading="isLoading"
              :show-apply-button="false"
            />
          </v-card-text>
          <v-card-actions class="pa-4 pt-0 flex-wrap ga-2">
            <v-btn variant="text" rounded="lg" @click="clearFiltersInDialog">
              Сбросить
            </v-btn>
            <v-spacer />
            <v-btn variant="text" rounded="lg" @click="filtersDialogOpen = false">
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              class="gv-cta"
              rounded="lg"
              :loading="isLoading"
              @click="applyFiltersFromDialog"
            >
              Применить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div v-if="quickTags.length" class="d-flex flex-wrap gap-2 mb-8">
        <button
          v-for="tag in quickTags"
          :key="tag.key"
          type="button"
          class="gv-chip-tag"
          :class="{ 'gv-chip-tag--active': activeQuickKey === tag.key }"
          @click="toggleQuickCategory(tag.key)"
        >
          {{ tag.label }}
        </button>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

      <div v-if="isLoading && !items.length" class="card-grid">
        <ListingCardSkeleton v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="items.length" class="card-grid">
        <RentalCard v-for="item in items" :key="item._id" :item="item" to-base="/rental-item" />
      </div>

      <EmptyState
        v-else
        title="Ничего не найдено"
        description="Попробуйте изменить фильтры или поиск."
        action-title="Сбросить"
        @action="resetCatalog"
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
  </div>
</template>

<style scoped>
.home-catalog__hero {
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.25rem);
  line-height: 1.2;
  color: var(--gv-text);
}

.home-catalog__lead {
  margin: 0;
  font-size: 16px;
  color: var(--gv-text-secondary);
}

.home-catalog__search :deep(.v-field) {
  border-radius: 15px;
}
</style>
