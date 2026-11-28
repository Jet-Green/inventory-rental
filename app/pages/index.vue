<script setup lang="ts">
import type { ICatalogFilters } from "~/types/rental";
import { useRentalCatalog } from "~/composables/useRentalCatalog";

const {
  categories,
  items,
  filters,
  isLoading,
  fetchCategories,
  categoriesFailed,
  fetchCatalog,
} = useRentalCatalog();

const searchLocal = ref("");
const draftFilters = ref<ICatalogFilters>({});

onMounted(() => Promise.all([fetchCategories(), fetchCatalog({}, 1)]));

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

const activeQuickKey = computed(() => filters.value.categories?.length === 1 ? filters.value.categories[0] : null);
const filtersDialogOpen = ref(false);

const activeFiltersCount = computed(() => {
  const f = filters.value;
  let n = 0;
  if (f.dateFrom || f.dateTo) n += 1;
  if (f.pickupType) n += 1;
  if (f.sortBy) n += 1;
  if (f.unitsNeeded) n += 1;
  if (f.categories?.length) n += 1;
  return n;
});

function openFilters() {
  draftFilters.value = { ...filters.value };
  filtersDialogOpen.value = true;
}

async function applySearch(): Promise<void> {
  await fetchCatalog({ ...filters.value, search: searchLocal.value || undefined }, 1);
}

async function applyFiltersFromDialog(): Promise<void> {
  filtersDialogOpen.value = false;
  await fetchCatalog({ ...draftFilters.value, search: searchLocal.value || undefined });
}

function clearFiltersInDialog() {
  draftFilters.value = {};
}

async function toggleQuickCategory(key: string): Promise<void> {
  if (activeQuickKey.value === key) {
    await fetchCatalog({ ...filters.value, categories: undefined }, 1);
    return;
  }

  await fetchCatalog({ ...filters.value, categories: [key] }, 1);
}

async function resetCatalog(): Promise<void> {
  filters.value = {};
  searchLocal.value = "";
  await fetchCatalog({}, 1);
}

useSeoMeta({
  title: "Аренда инвентаря — каталог оборудования",
  description: "Аренда инвентаря: спорт, детям, для ОВЗ и в поход. Бронирование онлайн.",
});
</script>

<template>
  <div class="home-catalog">
    <section class="home-catalog__hero-band">
      <div class="gv-page-wide px-4 px-sm-6 pt-8 pb-6 home-catalog__intro"><div>
        <h1 class="home-catalog__hero gv-display mb-3">
          Всё, что нужно, —
          <span class="gv-hand home-catalog__hero-accent">напрокат</span>
        </h1>
        <p class="home-catalog__lead mb-6">
          Спортивный инвентарь, детское снаряжение, техника для ОВЗ и походы —
          от местных арендодателей, с онлайн-бронированием и договором.
        </p><NuxtLink to="/listings" class="home-catalog__browse">Выбрать снаряжение <v-icon icon="mdi-arrow-down-right" size="20" /></NuxtLink>
      </div><div v-if="items.some(item => item.photos?.[0])" class="home-catalog__photos" aria-hidden="true"><img v-for="item in items.filter(item => item.photos?.[0]).slice(0, 2)" :key="item._id" :src="item.photos[0]" alt="" /></div></div>
    </section>

    <section class="gv-page-wide px-4 px-sm-6 pb-12 pt-6">

      <div class="home-catalog__search-panel d-flex flex-column flex-md-row ga-3 mb-6 align-stretch">
        <v-text-field
          v-model="searchLocal"
          aria-label="Поиск инвентаря"
          prepend-inner-icon="mdi-magnify"
          placeholder="Что хотите взять напрокат?"
          variant="outlined"
          density="comfortable"
          hide-details
          class="home-catalog__search flex-grow-1"
          rounded="lg"
          @keyup.enter="applySearch"
        />
        <div class="d-flex ga-3 flex-shrink-0">
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
              @click="openFilters"
            >
              Фильтры
            </v-btn>
          </v-badge>
        </div>
      </div>

      <v-dialog v-model="filtersDialogOpen" max-width="720" scrollable>
        <v-card class="pa-1 gv-modal">
          <v-card-title class="text-h6 font-weight-semibold pa-4 pb-2">
            Фильтры
          </v-card-title>
          <v-card-text class="pa-4 pt-2">
            <RentalCatalogFilters
              v-model="draftFilters"
              :categories="categories"
              :categories-failed="categoriesFailed"
              @retry-categories="fetchCategories"
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

      <div v-if="quickTags.length" class="d-flex flex-wrap ga-2 mb-8">
        <button
          v-for="tag in quickTags"
          :key="tag.key"
          type="button"
          class="gv-chip-tag"
          :class="{ 'gv-chip-tag--active': activeQuickKey === tag.key }"
          :aria-pressed="activeQuickKey === tag.key"
          @click="toggleQuickCategory(tag.key)"
        >
          {{ tag.label }}
        </button>
      </div>

      <RentalCatalogResults @reset="resetCatalog" />
    </section>
  </div>
</template>

<style scoped>
.home-catalog__hero-band {
  background:
    radial-gradient(120% 140% at 100% 0%, rgba(35, 175, 214, 0.1), transparent 55%),
    linear-gradient(180deg, #fff7ec 0%, var(--gv-bg-page) 100%);
  border-bottom: 1px solid var(--gv-border-light);
}

.home-catalog__hero {
  font-size: clamp(2rem, 1.3rem + 2.6vw, 3rem);
  line-height: 1.08;
  color: var(--gv-text);
}

.home-catalog__hero-accent {
  color: var(--gv-primary);
  font-size: 1.18em;
  line-height: 0.8;
  margin-left: 2px;
}

.home-catalog__lead {
  margin: 0;
  max-width: 620px;
  font-size: 16px;
  line-height: 1.55;
  color: var(--gv-text-secondary);
}

.home-catalog__search :deep(.v-field) {
  border-radius: var(--gv-radius-input);
}
.home-catalog__intro { display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: 48px; padding-bottom: 40px !important; }
.home-catalog__photos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.home-catalog__photos img { width: 100%; height: 250px; object-fit: cover; border-radius: 100px 100px 16px 16px; }
.home-catalog__photos img:nth-child(2) { margin-top: 34px; border-radius: 16px 16px 100px 100px; }
.home-catalog__browse { display: inline-flex; align-items: center; gap: 12px; color: var(--gv-primary); font-weight: 700; text-decoration: none; }
.home-catalog__search-panel { background: white; padding: 18px; border: 1px solid var(--gv-border-light); border-radius: var(--gv-radius-card); }
@media(max-width:959px) { .home-catalog__intro { gap:24px; } .home-catalog__photos img { height:190px; } }
@media(max-width:599px) { .home-catalog__intro { grid-template-columns:1fr; gap:22px; } .home-catalog__photos img { height:140px; border-radius:12px; } .home-catalog__photos img:nth-child(2) { margin-top:0; border-radius:12px; } .home-catalog__search-panel { padding:12px; } }
</style>
