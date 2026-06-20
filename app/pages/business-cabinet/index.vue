<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useMyListings } from "~/composables/useMyListings";
import { useOwnerBookings } from "~/composables/useOwnerBookings";

const { listings, fetchMyListings } = useMyListings();
const { bookings, fetchOwnerBookings, isLoading } = useOwnerBookings();

onMounted(() => {
  void fetchMyListings();
  void fetchOwnerBookings();
});

const activeBookingsCount = computed(
  () =>
    bookings.value.filter((b) =>
      ["pending", "confirmed", "active"].includes(b.status),
    ).length,
);

const revenueLabel = computed(() => {
  const sum = bookings.value
    .filter((b) => ["confirmed", "active", "completed"].includes(b.status))
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  return `${new Intl.NumberFormat("ru-RU").format(sum)} ₽`;
});

const publishedCount = computed(
  () => listings.value.filter((l) => l.moderationStatus === "active").length,
);
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Обзор</h1>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col cols="12" md="4">
        <StatCard
          label="Активные брони"
          :value="activeBookingsCount"
          icon="mdi-calendar-check"
        />
      </v-col>
      <v-col cols="12" md="4">
        <StatCard
          label="Выручка по сделкам"
          :value="revenueLabel"
          icon="mdi-cash-multiple"
        />
      </v-col>
      <v-col cols="12" md="4">
        <StatCard
          label="Опубликованных объявлений"
          :value="publishedCount"
          icon="mdi-clipboard-list-outline"
        />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap ga-3 mt-6">
      <v-btn to="/business-cabinet/listings/new" color="primary" class="gv-cta" rounded="lg">
        Добавить объявление
      </v-btn>
      <v-btn to="/business-cabinet/bookings" variant="outlined" color="primary" class="gv-cta" rounded="lg">
        К броням
      </v-btn>
    </div>
  </div>
</template>
