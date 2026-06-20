<script setup lang="ts">
import type { IRentalListing } from "~/types/rental";

const props = defineProps<{
  item: IRentalListing;
  toBase?: string;
}>();

const router = useRouter();

const cover = computed(() => props.item.photos?.[0] || "");

const to = computed(() => `${props.toBase || "/rental-item"}/${props.item._id}`);

const pickupLabel = computed(() => {
  if (props.item.pickupType === "pickup") return "Самовывоз";
  if (props.item.pickupType === "delivery") return "Доставка";
  return "Самовывоз / доставка";
});

const categoriesLine = computed(
  () => props.item.categories?.map((c) => c.name).join(" · ") || "Каталог",
);

const priceLabel = computed(() => {
  const p = props.item.pricePerDay;
  return new Intl.NumberFormat("ru-RU").format(p);
});

function open(): void {
  router.push(to.value);
}
</script>

<template>
  <article
    class="listing-card gv-card-elevated"
    role="link"
    tabindex="0"
    :aria-label="`${item.title}, ${priceLabel} ₽ в день`"
    @click="open"
    @keydown.enter="open"
  >
    <div
      class="listing-card__media"
      :class="{ 'listing-card__media--empty': !cover }"
      :style="cover ? { backgroundImage: `url(${cover})` } : undefined"
      role="img"
      :aria-label="item.title"
    />
    <div class="listing-card__body">
      <h3 class="listing-card__title">{{ item.title }}</h3>
      <p class="listing-card__meta">{{ categoriesLine }}</p>
      <p class="listing-card__sub">
        {{ pickupLabel }} · в наличии {{ item.unitsAvailable }} шт.
      </p>

      <div class="listing-card__footer">
        <span class="listing-card__price">
          {{ priceLabel }} ₽<span class="listing-card__per">/ день</span>
        </span>
        <span class="listing-card__cta gv-cta">
          Взять
          <v-icon icon="mdi-arrow-right" size="16" />
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.listing-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 380px;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.listing-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.1);
}

.listing-card:focus-visible {
  outline: 2px solid var(--gv-primary);
  outline-offset: 2px;
}

.listing-card__media {
  height: 190px;
  border-radius: 12px;
  margin: 0 0 12px;
  background-color: #eeeeee;
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
  font-size: 12px;
  color: var(--gv-available-text);
}

/* Низ карточки: цена слева, компактный CTA справа. margin-top auto
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

/* Компактный CTA-«пилюля». Спокойный по умолчанию, наливается оранжевым
   при наведении на карточку — чтобы оранжевые блоки не повторялись по всей сетке. */
.listing-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: var(--gv-radius-btn);
  border: 1.5px solid var(--gv-primary);
  color: var(--gv-primary);
  background: transparent;
  font-size: 13px;
  line-height: 1;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.listing-card:hover .listing-card__cta,
.listing-card:focus-visible .listing-card__cta {
  background: var(--gv-primary);
  color: #ffffff;
}
</style>
