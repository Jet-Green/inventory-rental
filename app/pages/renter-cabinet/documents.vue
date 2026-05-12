<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useMyBookings } from "~/composables/useMyBookings";
import dayjs from "dayjs";

const { bookings, fetchMyBookings, isLoading } = useMyBookings();

onMounted(() => {
  void fetchMyBookings();
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
      <h1 class="gv-display text-h4">Документы</h1>
      <v-text-field
        placeholder="Фильтр: тип / сделка"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 280px"
        rounded="lg"
        disabled
      />
    </div>
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="d-flex flex-column ga-3">
      <div
        v-for="booking in bookings"
        :key="booking._id + '-rental'"
        class="gv-card-elevated pa-5"
      >
        <p class="font-weight-semibold mb-2">Договор аренды</p>
        <p class="text-caption text-medium-emphasis mb-2">
          Бронь: {{ booking._id?.slice(-8) }} · {{ dayjs().format("DD.MM.YYYY") }}
        </p>
        <p class="text-caption text-medium-emphasis mb-3">Статус: подписан</p>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            v-if="booking.rentalAgreementPdfUrl"
            :href="booking.rentalAgreementPdfUrl"
            tag="a"
            target="_blank"
            variant="outlined"
            color="primary"
            class="gv-cta"
            rounded="lg"
          >
            Открыть PDF
          </v-btn>
          <v-btn
            v-if="booking.rentalAgreementPdfUrl"
            :href="booking.rentalAgreementPdfUrl"
            tag="a"
            download
            color="primary"
            class="gv-cta"
            rounded="lg"
          >
            Скачать
          </v-btn>
        </div>
      </div>

      <div class="gv-card-elevated pa-5">
        <p class="font-weight-semibold mb-2">Агентский договор</p>
        <p class="text-caption text-medium-emphasis mb-2">Бронь: — · {{ dayjs().format("DD.MM.YYYY") }}</p>
        <p class="text-caption text-medium-emphasis mb-3">Статус: на подписи</p>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" disabled>
            Открыть PDF
          </v-btn>
          <v-btn color="primary" class="gv-cta" rounded="lg" disabled>Скачать</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
