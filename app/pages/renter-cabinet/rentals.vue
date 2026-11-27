<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useMyBookings } from "~/composables/useMyBookings";

const { bookings, fetchMyBookings, isLoading } = useMyBookings();

const loadError = ref(false);
async function loadBookings() {
  loadError.value = false;
  try { await fetchMyBookings(); }
  catch { loadError.value = true; }
}
onMounted(() => { void loadBookings(); });

function listingIdOf(listingId: unknown): string {
  if (listingId && typeof listingId === "object") {
    return (listingId as { _id?: string })._id || "";
  }
  return String(listingId || "");
}
</script>

<template>
  <div class="private-page px-4 px-sm-6 py-8">
    <div class="rental-heading mb-6"><h1 class="gv-display text-h4">Мои аренды</h1><v-btn to="/listings" variant="outlined" color="primary" class="gv-cta" prepend-icon="mdi-plus">Найти инвентарь</v-btn></div>
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
      Не удалось загрузить данные.
      <v-btn variant="text" size="small" :loading="isLoading" @click="loadBookings">Повторить</v-btn>
    </v-alert>
    <v-skeleton-loader v-if="isLoading && !bookings.length" type="list-item-two-line, list-item-two-line" class="mb-4" />

    <div v-if="bookings.length" class="d-flex flex-column ga-4">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="gv-card-elevated rental-row pa-5"
      >
        <p class="rental-row__title font-weight-semibold mb-2">
          {{ booking.listingId?.title || "Бронирование" }}
        </p>
        <div class="d-flex align-center ga-2 mb-2 flex-wrap">
          <span class="text-caption text-medium-emphasis">
            {{ booking.dateFrom?.slice(0, 10) }} — {{ booking.dateTo?.slice(0, 10) }}
          </span>
          <StatusChip :status="booking.status" type="booking" />
        </div>
        <p v-if="booking.rentalAgreementPdfUrl" class="text-caption mb-3">
          <a
            :href="booking.rentalAgreementPdfUrl"
            target="_blank"
            rel="noopener"
            class="gv-link"
          >
            Договор.pdf
          </a>
        </p>
        <v-btn
          :to="`/rental-item/${listingIdOf(booking.listingId)}`"
          variant="outlined"
          color="primary"
          class="gv-cta"
          size="small"
        >
          Открыть объявление
        </v-btn>
      </div>
    </div>
    <EmptyState
      v-else-if="!isLoading && !loadError"
      title="Бронирований пока нет"
      description="Найдите оборудование в каталоге и оформите первую аренду."
      action-title="В каталог"
      @action="navigateTo('/')"
    />

  </div>
</template>

<style scoped>
.rental-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.rental-row { position: relative; border-left: 3px solid var(--gv-primary) !important; }
.rental-row__title { font-size: 18px; }
</style>
