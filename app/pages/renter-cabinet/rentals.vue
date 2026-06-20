<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useMyBookings } from "~/composables/useMyBookings";

const { bookings, fetchMyBookings, isLoading } = useMyBookings();

onMounted(() => {
  void fetchMyBookings();
});

function listingIdOf(listingId: unknown): string {
  if (listingId && typeof listingId === "object") {
    return (listingId as { _id?: string })._id || "";
  }
  return String(listingId || "");
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Мои аренды</h1>
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div v-if="bookings.length" class="d-flex flex-column ga-4">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="gv-card-elevated pa-5"
      >
        <p class="font-weight-semibold mb-2">
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
          rounded="lg"
          size="small"
        >
          Подробнее
        </v-btn>
      </div>
    </div>
    <EmptyState
      v-else-if="!isLoading"
      title="Бронирований пока нет"
      description="Найдите оборудование в каталоге и оформите первую аренду."
      action-title="В каталог"
      @action="navigateTo('/')"
    />
    <p v-else class="text-medium-emphasis">Загрузка…</p>
  </div>
</template>
