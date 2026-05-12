<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useMyBookings } from "~/composables/useMyBookings";

const { bookings, fetchMyBookings, isLoading } = useMyBookings();

onMounted(() => {
  void fetchMyBookings();
});

function statusRu(status: string): string {
  const map: Record<string, string> = {
    pending: "Ожидает оплаты",
    confirmed: "Оплачено",
    cancelled: "Отменено",
  };
  return map[status] || status;
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
        <p class="text-caption text-medium-emphasis mb-2">
          {{ booking.dateFrom?.slice(0, 10) }} — {{ booking.dateTo?.slice(0, 10) }} ·
          {{ statusRu(booking.status) }}
        </p>
        <p class="text-caption mb-3" style="color: var(--gv-link)">
          Бизнес: см. договор ·
          <a
            v-if="booking.rentalAgreementPdfUrl"
            :href="booking.rentalAgreementPdfUrl"
            target="_blank"
            class="gv-link"
          >
            Договор.pdf
          </a>
        </p>
        <v-btn
          :to="`/rental-item/${typeof booking.listingId === 'object' && booking.listingId ? booking.listingId._id : booking.listingId || ''}`"
          variant="outlined"
          color="primary"
          class="gv-cta"
          rounded="lg"
        >
          Подробнее
        </v-btn>
      </div>
    </div>
    <p v-else class="text-medium-emphasis">Бронирований пока нет.</p>
  </div>
</template>
