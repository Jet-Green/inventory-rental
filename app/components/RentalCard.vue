<script setup lang="ts">
import { rentalHandoffQuery } from "~/utils/rentalHandoff";
import type { IRentalListing } from "~/types/rental";

const props = defineProps<{
  item: IRentalListing;
  toBase?: string;
}>();

const route = useRoute();
const { filters, categories } = useRentalCatalog();

const cover = computed(() => props.item.photos?.[0] || "");

const to = computed(() => ({ path: `${props.toBase || "/rental-item"}/${props.item._id}`, query: rentalHandoffQuery({ ...route.query, ...filters.value, unitsNeeded: String(filters.value.unitsNeeded || route.query.unitsNeeded || "") }) }));

const categoriesLine = computed(
  () => props.item.categories?.map((c) => typeof c === "string" ? categories.value.find(category => category.key === c)?.name || c : c.name).filter(Boolean).join(" · ") || "Каталог",
);

const priceLabel = computed(() => {
  const p = props.item.pricePerDay;
  return new Intl.NumberFormat("ru-RU").format(p);
});

</script>

<template>
  <NuxtLink :to="to" class="listing-card gv-card-elevated" :aria-label="`Аренда: ${item.title}, ${priceLabel} ₽ в день`">
    <div
      class="listing-card__media"
      :class="{ 'listing-card__media--empty': !cover }"
      :style="cover ? { backgroundImage: `url(${cover})` } : undefined"
      role="img"
      :aria-label="cover ? item.title : `${item.title}: фото отсутствует`"
    ><span v-if="!cover" class="listing-card__placeholder"><v-icon icon="mdi-image-outline" size="36" />Фото скоро появится</span></div>
    <div class="listing-card__body">
      <h3 class="listing-card__title">{{ item.title }}</h3>
      <p class="listing-card__meta">{{ categoriesLine }}</p>
      <p class="listing-card__sub">
        <v-icon icon="mdi-calendar-blank-outline" size="14" class="listing-card__sub-icon" />
        посуточно · в наличии {{ item.unitsAvailable }} шт.
      </p>

      <div class="listing-card__footer">
        <span class="listing-card__price">
          {{ priceLabel }} ₽<span class="listing-card__per">/ день</span>
        </span>
        <span class="listing-card__go" aria-hidden="true">
          <v-icon icon="mdi-arrow-right" size="18" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.listing-card {
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 360px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

/* Ховер без «плавающей» тени: карточка чуть приподнимается, граница темнеет. */
.listing-card:hover {
  transform: translateY(-2px);
  border-color: var(--gv-border);
}

.listing-card:focus-visible {
  outline: 2px solid var(--gv-primary);
  outline-offset: 2px;
}

.listing-card__media {
  aspect-ratio: 4 / 3;
  height: auto;
  border-radius: var(--gv-radius-thumb);
  margin: 0 0 12px;
  background-color: var(--gv-border-light);
  background-size: cover;
  background-position: center;
}

.listing-card__media--empty {
  background-image: none !important;
}

.listing-card__body {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.listing-card__title {
  font-family: var(--gv-font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--gv-text);
  line-height: 1.3;
}

.listing-card__meta {
  margin: 0;
  font-size: 12px;
  color: var(--gv-text-secondary);
}

.listing-card__sub {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--gv-available-text);
}

.listing-card__sub-icon {
  color: var(--gv-available-text);
}

/* Низ карточки: цена слева, стрелка-«перейти» справа. margin-top auto
   прижимает блок к низу, чтобы у всех карточек он был на одной линии. */
.listing-card__footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.listing-card__price {
  font-size: 19px;
  font-weight: 700;
  color: var(--gv-text);
  white-space: nowrap;
}

.listing-card__per {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--gv-text-muted);
}

/* Стрелка-аффорданс вместо кнопки. Спокойная в покое, наливается
   оранжевым при наведении на карточку — «можно открыть и взять». */
.listing-card__go {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1.5px solid var(--gv-primary-soft-border);
  color: var(--gv-primary);
  background: var(--gv-primary-soft-bg);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.listing-card:hover .listing-card__go,
.listing-card:focus-visible .listing-card__go {
  background: var(--gv-primary);
  border-color: var(--gv-primary);
  color: var(--gv-surface);
  transform: translateX(2px);
}
.listing-card__placeholder { display: flex; height: 100%; min-height: 180px; align-items: center; justify-content: center; flex-direction: column; gap: 10px; color: var(--gv-text-muted); font-size: 13px; }
</style>
