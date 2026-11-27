<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useOwnerBookings } from "~/composables/useOwnerBookings";
import type { BookingStatus, IBookingItem } from "~/types/rental";

const { bookings, fetchOwnerBookings, isLoading } = useOwnerBookings();

const loadError = ref(false);
async function load(): Promise<void> {
  loadError.value = false;
  try {
    await fetchOwnerBookings();
  } catch {
    loadError.value = true;
  }
}
onMounted(() => {
  void load();
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
const search = ref("");
const payoutRows = computed(() =>
  bookings.value
    .filter(
      (b) =>
        ["confirmed", "active", "completed"].includes(b.status) &&
        `${b.listingId?.title || ""} ${renterLine(b)}`
          .toLocaleLowerCase()
          .includes((search.value || "").trim().toLocaleLowerCase()),
    )
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
  <div class="business-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Выплаты</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Расчёты проходят через платформу-агента. Реальный вывод средств
      подключается вместе с эквайрингом — ниже предварительный расчёт по вашим
      броням.
    </p>

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
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-row class="mb-2 payout-summary">
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

    <div class="business-section-heading mt-6"><h2>История начислений</h2></div>
    <div class="business-toolbar">
      <v-text-field
        v-model="search"
        label="Найти начисление"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        @click:clear="search = ''"
      /><span class="business-muted">{{ payoutRows.length }} начислений</span>
    </div>

    <div v-if="payoutRows.length" class="d-flex flex-column ga-3">
      <div
        v-for="b in payoutRows"
        :key="b._id"
        class="business-panel payout-row"
      >
        <div class="flex-grow-1" style="min-width: 0">
          <p class="font-weight-semibold mb-1">
            {{ b.listingId?.title || "Объявление" }}
          </p>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ renterLine(b) }} · {{ b.dateFrom?.slice(0, 10) }} —
            {{ b.dateTo?.slice(0, 10) }}
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
            сумма {{ money(b.totalPrice || 0) }} − комиссия
            {{ money(b.agentCommission) }}
          </p>
          <StatusChip :status="b.status" type="booking" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!isLoading && !loadError"
      :title="search ? 'Начисления не найдены' : 'Начислений пока нет'"
      description="Здесь появятся выплаты по оплаченным и завершённым броням."
    />
  </div>
</template>
<style scoped>
.payout-summary :deep(.stat-card) {
  box-shadow: none;
}
.payout-summary > :first-child :deep(.stat-card) {
  border-top-color: var(--gv-primary);
  background: var(--gv-primary-soft-bg);
}
.payout-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, auto);
  gap: 20px;
  align-items: center;
}
@media (max-width: 600px) {
  .payout-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .payout-row > .text-right {
    text-align: left !important;
  }
}
</style>
