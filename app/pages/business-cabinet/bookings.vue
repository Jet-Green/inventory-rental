<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { toast } from "vue3-toastify";
import { useOwnerBookings } from "~/composables/useOwnerBookings";
import type { BookingStatus, IBookingItem } from "~/types/rental";

const { bookings, fetchOwnerBookings, changeStatus, updatingId, isLoading } =
  useOwnerBookings();

onMounted(() => {
  void fetchOwnerBookings();
});

/** Разрешённые переходы статусов из API-контракта §3 (PATCH /booking/:id/status). */
const TRANSITIONS: Record<BookingStatus, Array<{ status: BookingStatus; label: string; color: string }>> = {
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
  try {
    await changeStatus(id, status);
    toast("Статус брони обновлён.", { type: "success", autoClose: 4000 });
  } catch {
    // ошибка/недопустимый переход уже показаны toast-перехватчиком плагина
  }
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Брони</h1>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div v-if="bookings.length" class="d-flex flex-column ga-4">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="gv-card-elevated pa-5"
      >
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-2">
          <p class="font-weight-semibold mb-0">
            {{ booking.listingId?.title || "Объявление" }}
          </p>
          <StatusChip :status="booking.status" type="booking" />
        </div>
        <p class="text-caption text-medium-emphasis mb-1">
          {{ renterLine(booking) }}
        </p>
        <p class="text-caption text-medium-emphasis mb-3">
          {{ booking.dateFrom?.slice(0, 10) }} — {{ booking.dateTo?.slice(0, 10) }} ·
          {{ booking.units }} шт. · {{ totalLabel(booking) }}
        </p>

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
            rounded="lg"
            size="small"
            :loading="updatingId === booking._id"
            @click="onChange(booking._id, t.status)"
          >
            {{ t.label }}
          </v-btn>
        </div>
        <p v-else class="text-caption text-disabled mb-0">Финальный статус</p>
      </div>
    </div>

    <EmptyState
      v-else-if="!isLoading"
      title="Броней пока нет"
      description="Здесь появятся брони по вашим объявлениям."
    />
  </div>
</template>
