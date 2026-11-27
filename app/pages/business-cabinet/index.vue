<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useMyListings } from "~/composables/useMyListings";
import { useOwnerBookings } from "~/composables/useOwnerBookings";

const {
  listings,
  fetchMyListings,
  isLoading: listingsLoading,
} = useMyListings();
const { bookings, fetchOwnerBookings, isLoading } = useOwnerBookings();

const loadError = ref(false);
async function load(): Promise<void> {
  loadError.value = false;
  try {
    await Promise.all([fetchMyListings(), fetchOwnerBookings()]);
  } catch {
    loadError.value = true;
  }
}
onMounted(() => {
  void load();
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
const upcoming = computed(() =>
  bookings.value
    .filter((b) => ["pending", "confirmed", "active"].includes(b.status))
    .slice()
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
    .slice(0, 4),
);
const needsAttention = computed(() =>
  listings.value
    .filter((l) => ["draft", "rejected"].includes(l.moderationStatus))
    .slice(0, 4),
);
function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU");
}
</script>

<template>
  <div class="business-page px-4 px-sm-6 py-8">
    <div class="business-section-heading">
      <h1 class="gv-display text-h4">Обзор</h1>
      <v-btn
        to="/business-cabinet/listings/new"
        color="primary"
        class="gv-cta"
        prepend-icon="mdi-plus"
        >Добавить объявление</v-btn
      >
    </div>
    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
      title="Не удалось загрузить данные"
    >
      <v-btn variant="text" :disabled="isLoading" @click="load"
        >Повторить</v-btn
      >
    </v-alert>

    <v-progress-linear
      v-if="isLoading || listingsLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

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

    <div class="business-split mt-6">
      <section class="business-panel">
        <div class="business-section-heading">
          <h2>Ближайшие брони</h2>
          <NuxtLink to="/business-cabinet/bookings" class="gv-link"
            >Все брони</NuxtLink
          >
        </div>
        <div
          v-for="booking in upcoming"
          :key="booking._id"
          class="overview-row"
        >
          <div>
            <p class="font-weight-semibold mb-1">
              {{ booking.listingId?.title || "Объявление" }}
            </p>
            <p class="business-muted mb-0">
              {{ dateLabel(booking.dateFrom) }} —
              {{ dateLabel(booking.dateTo) }} · {{ booking.units }} шт.
            </p>
          </div>
          <StatusChip :status="booking.status" type="booking" />
        </div>
        <p
          v-if="!isLoading && !loadError && !upcoming.length"
          class="business-muted mb-0"
        >
          Активных броней пока нет.
        </p>
      </section>
      <section class="business-panel">
        <div class="business-section-heading">
          <h2>Объявления</h2>
          <NuxtLink to="/business-cabinet/listings" class="gv-link"
            >Управлять</NuxtLink
          >
        </div>
        <div
          v-for="item in needsAttention"
          :key="item._id"
          class="overview-row"
        >
          <span>{{ item.title }}</span
          ><StatusChip :status="item.moderationStatus" type="listing" />
        </div>
        <p
          v-if="!listingsLoading && !loadError && !needsAttention.length"
          class="business-muted mb-0"
        >
          Нет объявлений, требующих доработки.
        </p>
        <v-btn
          to="/business-cabinet/calendar"
          variant="outlined"
          color="primary"
          class="gv-cta mt-5"
          prepend-icon="mdi-calendar"
          >Открыть календарь</v-btn
        >
      </section>
    </div>
  </div>
</template>
<style scoped>
.overview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-block: 16px;
  border-top: 1px solid var(--gv-border-light);
}
</style>
