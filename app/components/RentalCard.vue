<script setup lang="ts">
import type { IRentalListing } from "~/types/rental";

const props = defineProps<{
  item: IRentalListing;
  toBase?: string;
}>();

const router = useRouter();

const cover = computed(
  () =>
    props.item.photos?.[0] ||
    "",
);

const to = computed(() => `${props.toBase || "/rental-item"}/${props.item._id}`);

const pickupLabel = computed(() => {
  if (props.item.pickupType === "pickup") return "Самовывоз";
  if (props.item.pickupType === "delivery") return "Доставка";
  return "Самовывоз / доставка";
});

const categoriesLine = computed(() =>
  props.item.categories?.map((c) => c.name).join(" · ") || "Каталог",
);

const priceLabel = computed(() => {
  const p = props.item.pricePerDay;
  return `${new Intl.NumberFormat("ru-RU").format(p)} ₽ / день`;
});

function open(): void {
  router.push(to.value);
}
</script>

<template>
  <article class="listing-card gv-card-elevated">
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
      <div class="listing-card__price-row">
        <span class="listing-card__price">{{ priceLabel }}</span>
        <span class="listing-card__pickup">· {{ pickupLabel }}</span>
      </div>
      <p class="listing-card__stock">
        Доступно: {{ item.unitsAvailable }} шт.
      </p>
      <v-btn
        block
        color="primary"
        class="gv-cta mt-1"
        rounded="lg"
        @click.stop="open"
      >
        Взять
      </v-btn>
    </div>
  </article>
</template>

<style scoped>
.listing-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 420px;
}

.listing-card__media {
  height: 200px;
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
  gap: 8px;
  flex: 1;
}

.listing-card__title {
  font-family: var(--gv-font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--gv-text);
}

.listing-card__meta {
  margin: 0;
  font-size: 12px;
  color: var(--gv-text-secondary);
}

.listing-card__price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
}

.listing-card__price {
  font-size: 18px;
  font-weight: 600;
  color: var(--gv-primary);
}

.listing-card__pickup {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.listing-card__stock {
  margin: 0;
  font-size: 12px;
  color: var(--gv-available);
}
</style>
