<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useOwnerBookings } from "~/composables/useOwnerBookings";
import type { BookingStatus, IBookingItem } from "~/types/rental";

const { bookings, fetchOwnerBookings, isLoading } = useOwnerBookings();

onMounted(() => {
  void fetchOwnerBookings();
});

/** Нетто к выплате арендодателю = сумма брони − комиссия агента (платформы). */
function net(b: IBookingItem): number {
  const total = b.totalPrice || 0;
  const commission = b.agentCommission || 0;
  return Math.max(total - commission, 0);
}

function money(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function sumByStatuses(statuses: BookingStatus[]): number {
  return bookings.value
    .filter((b) => statuses.includes(b.status))
    .reduce((acc, b) => acc + net(b), 0);
}

/** Завершённые аренды — деньги, доступные к выводу. */
const available = computed(() => sumByStatuses(["completed"]));
/** Оплачено арендатором, аренда идёт или впереди — в обработке. */
const inProgress = computed(() => sumByStatuses(["confirmed", "active"]));
/** Всё подтверждённое (оплаченное) за всё время. */
const earnedTotal = computed(() =>
  sumByStatuses(["confirmed", "active", "completed"]),
);

/** Брони, относящиеся к выплатам (оплаченные/завершённые), новые сверху. */
const payoutRows = computed(() =>
  bookings.value
    .filter((b) => ["confirmed", "active", "completed"].includes(b.status))
    .slice()
    .sort((a, b) => (b.dateFrom || "").localeCompare(a.dateFrom || "")),
);

function renterLine(b: IBookingItem): string {
  const r = b.renterId;
  if (!r) return "Арендатор";
  if (typeof r === "string") return r;
  return [r.fullName, r.email].filter(Boolean).join(" · ") || "Арендатор";
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Выплаты</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Расчёты проходят через платформу-агента. Реальный вывод средств подключается
      вместе с эквайрингом — ниже предварительный расчёт по вашим броням.
    </p>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <StatCard
          label="Доступно к выплате"
          :value="money(available)"
          delta="по завершённым арендам"
          icon="mdi-cash-check"
        />
      </v-col>
      <v-col cols="12" md="4">
        <StatCard
          label="В обработке"
          :value="money(inProgress)"
          delta="оплачено, аренда идёт или впереди"
          icon="mdi-cash-clock"
        />
      </v-col>
      <v-col cols="12" md="4">
        <StatCard
          label="Всего заработано"
          :value="money(earnedTotal)"
          delta="за всё время"
          icon="mdi-chart-line"
        />
      </v-col>
    </v-row>

    <h2 class="text-subtitle-1 font-weight-semibold mt-6 mb-3">История начислений</h2>

    <div v-if="payoutRows.length" class="d-flex flex-column ga-3">
      <div
        v-for="b in payoutRows"
        :key="b._id"
        class="gv-card-elevated pa-4 d-flex flex-wrap align-center justify-space-between ga-3"
      >
        <div class="flex-grow-1" style="min-width: 200px">
          <p class="font-weight-semibold mb-1">
            {{ b.listingId?.title || "Объявление" }}
          </p>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ renterLine(b) }} ·
            {{ b.dateFrom?.slice(0, 10) }} — {{ b.dateTo?.slice(0, 10) }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-body-1 font-weight-bold text-primary mb-1">
            {{ money(net(b)) }}
          </p>
          <p
            v-if="b.agentCommission"
            class="text-caption text-medium-emphasis mb-1"
          >
            сумма {{ money(b.totalPrice || 0) }} − комиссия {{ money(b.agentCommission) }}
          </p>
          <StatusChip :status="b.status" type="booking" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!isLoading"
      title="Начислений пока нет"
      description="Здесь появятся выплаты по оплаченным и завершённым броням."
    />
  </div>
</template>
