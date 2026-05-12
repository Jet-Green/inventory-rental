<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useMyListings } from "~/composables/useMyListings";
import type { IRentalListing } from "~/types/rental";

const { listings, fetchMyListings, isLoading } = useMyListings();

onMounted(() => {
  void fetchMyListings();
});

function statusRu(item: IRentalListing): string {
  const m: Record<string, string> = {
    pending: "На модерации",
    active: "Опубликовано",
    rejected: "Отклонено",
    hidden: "Скрыто",
  };
  return m[item.moderationStatus] || item.moderationStatus;
}
</script>

<template>
  <div class="px-4 px-sm-6 py-6">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
      <h1 class="gv-display text-h4">Мои объявления</h1>
      <div class="d-flex ga-2 flex-wrap align-center">
        <v-text-field
          placeholder="Фильтр: статус"
          variant="outlined"
          density="comfortable"
          hide-details
          style="width: 220px"
          rounded="lg"
          disabled
        />
        <v-btn to="/business-cabinet/listings/new" color="primary" class="gv-cta" rounded="lg">
          Добавить объявление
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="d-flex flex-column ga-4">
      <div
        v-for="item in listings"
        :key="item._id"
        class="gv-card-elevated pa-4 d-flex flex-wrap ga-4 align-center"
      >
        <div
          class="listing-row__img rounded-lg"
          :style="
            item.photos?.[0]
              ? { backgroundImage: `url(${item.photos[0]})` }
              : undefined
          "
        />
        <div class="flex-grow-1" style="min-width: 200px">
          <p class="font-weight-semibold mb-1">{{ item.title }}</p>
          <p class="text-caption text-medium-emphasis mb-1">
            {{ new Intl.NumberFormat("ru-RU").format(item.pricePerDay) }} ₽ / день ·
            {{ statusRu(item) }}
          </p>
          <p class="text-caption text-disabled">Активных броней: —</p>
        </div>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" size="small">
            Редактировать
          </v-btn>
          <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" size="small">
            Скрыть
          </v-btn>
          <v-btn color="primary" class="gv-cta" rounded="lg" size="small" to="/business-cabinet/calendar">
            Календарь
          </v-btn>
        </div>
      </div>
    </div>

    <p v-if="!listings.length && !isLoading" class="text-medium-emphasis mt-4">
      Объявлений пока нет.
    </p>
  </div>
</template>

<style scoped>
.listing-row__img {
  width: 140px;
  height: 100px;
  background: #e8e8e8;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
</style>
