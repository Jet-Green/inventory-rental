<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { toast } from "vue3-toastify";
import { useOwnerBookings } from "~/composables/useOwnerBookings";
import type { BookingStatus, IBookingItem } from "~/types/rental";

const { bookings, fetchOwnerBookings, changeStatus, updatingId, isLoading } =
  useOwnerBookings();

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

/** Разрешённые переходы статусов из API-контракта §3 (PATCH /booking/:id/status). */
const TRANSITIONS: Record<
  BookingStatus,
  Array<{ status: BookingStatus; label: string; color: string }>
> = {
  pending: [
    { status: "confirmed", label: "Подтвердить", color: "primary" },
    { status: "cancelled", label: "Отменить", color: "error" },
  ],
  confirmed: [
    { status: "active", label: "В работу", color: "success" },
    { status: "cancelled", label: "Отменить", color: "error" },
  ],
  active: [
    { status: "completed", label: "Завершить", color: "primary" },
    { status: "cancelled", label: "Отменить", color: "error" },
  ],
  completed: [],
  cancelled: [],
};

function renterLine(booking: IBookingItem): string {
  const r = booking.renterId;
  if (!r) return "Арендатор";
  if (typeof r === "string") return r;
  return [r.fullName, r.email].filter(Boolean).join(" · ") || "Арендатор";
}

function totalLabel(booking: IBookingItem): string {
  if (!booking.totalPrice && booking.totalPrice !== 0) return "—";
  return `${new Intl.NumberFormat("ru-RU").format(booking.totalPrice)} ₽`;
}

async function onChange(id: string, status: BookingStatus): Promise<void> {
  if (updatingId.value) return;
  try {
    await changeStatus(id, status);
    toast("Статус брони обновлён.", { type: "success", autoClose: 4000 });
  } catch {
    // ошибка/недопустимый переход уже показаны toast-перехватчиком плагина
  }
}
const search = ref("");
const statusFilter = ref("all");
const statusOptions = [
  { title: "Все статусы", value: "all" },
  { title: "Новые", value: "pending" },
  { title: "Подтверждены", value: "confirmed" },
  { title: "В работе", value: "active" },
  { title: "Завершены", value: "completed" },
  { title: "Отменены", value: "cancelled" },
];
const filteredBookings = computed(() =>
  bookings.value.filter(
    (b) =>
      (statusFilter.value === "all" || b.status === statusFilter.value) &&
      `${b.listingId?.title || ""} ${renterLine(b)} ${b._id}`
        .toLocaleLowerCase()
        .includes((search.value || "").trim().toLocaleLowerCase()),
  ),
);
function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU");
}
</script>

<template>
  <div class="business-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Брони</h1>

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
    <div class="business-toolbar">
      <v-text-field
        v-model="search"
        label="Найти бронь или арендатора"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        @click:clear="search = ''"
      />
      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        label="Статус"
        hide-details
      />
      <span class="business-muted"
        >{{ filteredBookings.length }} из {{ bookings.length }}</span
      >
    </div>
    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div v-if="filteredBookings.length" class="d-flex flex-column ga-4">
      <div
        v-for="booking in filteredBookings"
        :key="booking._id"
        class="business-panel booking-row"
      >
        <div class="booking-row__main">
          <div
            class="d-flex flex-wrap align-center justify-space-between ga-3 mb-2"
          >
            <p class="font-weight-semibold mb-0">
              {{ booking.listingId?.title || "Объявление" }}
            </p>
            <StatusChip :status="booking.status" type="booking" />
          </div>
          <p class="text-caption text-medium-emphasis mb-1">
            {{ renterLine(booking) }}
          </p>
          <p class="text-caption text-medium-emphasis mb-3">
            {{ dateLabel(booking.dateFrom) }} —
            {{ dateLabel(booking.dateTo) }} · {{ booking.units }} шт.
          </p>
        </div>
        <div class="booking-row__amount font-weight-bold">
          {{ totalLabel(booking) }}
        </div>
        <div
          v-if="TRANSITIONS[booking.status]?.length"
          class="d-flex ga-2 flex-wrap"
        >
          <v-btn
            v-for="t in TRANSITIONS[booking.status]"
            :key="t.status"
            :color="t.color"
            :variant="t.color === 'error' ? 'outlined' : 'flat'"
            class="gv-cta"
            size="small"
            :loading="updatingId === booking._id"
            :disabled="!!updatingId"
            @click="onChange(booking._id, t.status)"
          >
            {{ t.label }}
          </v-btn>
        </div>
        <p v-else class="text-caption text-disabled mb-0">Финальный статус</p>
      </div>
    </div>

    <EmptyState
      v-else-if="!isLoading && !loadError"
      :title="bookings.length ? 'Брони не найдены' : 'Броней пока нет'"
      :description="
        bookings.length
          ? 'Измените поиск или статус.'
          : 'Здесь появятся брони по вашим объявлениям.'
      "
    />
  </div>
</template>
<style scoped>
.booking-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px 24px;
}
.booking-row__main {
  min-width: 0;
}
.booking-row__amount {
  font-size: 22px;
  text-align: right;
}
@media (max-width: 600px) {
  .booking-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .booking-row__amount {
    text-align: left;
  }
}
</style>
