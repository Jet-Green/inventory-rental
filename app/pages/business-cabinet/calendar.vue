<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import dayjs from "dayjs";
import { useOwnerBookings } from "~/composables/useOwnerBookings";
import type { IBookingItem } from "~/types/rental";

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

/** Текущий отображаемый месяц (первое число). */
const cursor = useState("business-calendar-cursor", () =>
  dayjs().startOf("month").toISOString(),
);
const month = computed(() => dayjs(cursor.value));
const selectedDate = ref<string>("");

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const monthLabel = computed(() => {
  const raw = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(month.value.toDate());
  return raw.replace(/^./, (c) => c.toUpperCase());
});

const listingFilter = ref("");
const listingOptions = computed(() => [
  { title: "Все объявления", value: "" },
  ...Array.from(
    new Map(
      bookings.value
        .filter((b) => b.listingId?._id)
        .map((b) => [
          b.listingId._id,
          { title: b.listingId.title, value: b.listingId._id },
        ]),
    ).values(),
  ),
]);
watch(listingFilter, () => {
  selectedDate.value = "";
});
/** Брони, занимающие календарь (всё, кроме отменённых). */
const activeBookings = computed(() =>
  bookings.value.filter(
    (b) =>
      b.status !== "cancelled" &&
      (!listingFilter.value || b.listingId?._id === listingFilter.value),
  ),
);

function dayValue(iso?: string): number {
  return dayjs(iso).startOf("day").valueOf();
}

function bookingsOnDate(dateStr: string): IBookingItem[] {
  const d = dayValue(dateStr);
  return activeBookings.value.filter(
    (b) => d >= dayValue(b.dateFrom) && d <= dayValue(b.dateTo),
  );
}

interface DayCell {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  count: number;
}

/** Сетка 6×7, неделя с понедельника, с днями соседних месяцев для выравнивания. */
const cells = computed<DayCell[]>(() => {
  const start = month.value.startOf("month");
  // dayjs: 0=Вс..6=Сб → смещение к понедельнику
  const offset = (start.day() + 6) % 7;
  const gridStart = start.subtract(offset, "day");
  const today = dayjs().format("YYYY-MM-DD");

  return Array.from({ length: 42 }, (_, i) => {
    const d = gridStart.add(i, "day");
    const date = d.format("YYYY-MM-DD");
    return {
      date,
      day: d.date(),
      inMonth: d.month() === start.month(),
      isToday: date === today,
      count: bookingsOnDate(date).length,
    };
  });
});

const selectedBookings = computed(() =>
  selectedDate.value ? bookingsOnDate(selectedDate.value) : [],
);

const selectedLabel = computed(() =>
  selectedDate.value
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(
        dayjs(selectedDate.value).toDate(),
      )
    : "",
);

function prevMonth(): void {
  cursor.value = month.value
    .subtract(1, "month")
    .startOf("month")
    .toISOString();
  selectedDate.value = "";
}

function nextMonth(): void {
  cursor.value = month.value.add(1, "month").startOf("month").toISOString();
  selectedDate.value = "";
}

function goToday(): void {
  cursor.value = dayjs().startOf("month").toISOString();
  selectedDate.value = dayjs().format("YYYY-MM-DD");
}

function selectDay(cell: DayCell): void {
  if (!cell.count) {
    selectedDate.value = "";
    return;
  }
  selectedDate.value = cell.date === selectedDate.value ? "" : cell.date;
}

function renterLine(b: IBookingItem): string {
  const r = b.renterId;
  if (!r) return "Арендатор";
  if (typeof r === "string") return r;
  return [r.fullName, r.email].filter(Boolean).join(" · ") || "Арендатор";
}
</script>

<template>
  <div class="business-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Календарь</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Занятость по вашим объявлениям. Дни с бронями выделены — нажмите, чтобы
      увидеть детали.
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
    <div class="business-toolbar">
      <v-select
        v-model="listingFilter"
        :items="listingOptions"
        label="Объявление"
        hide-details
      /><NuxtLink to="/business-cabinet/bookings" class="gv-link"
        >Все брони</NuxtLink
      >
    </div>
    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div class="business-split calendar-workspace">
      <div class="business-panel calendar-board">
        <div class="d-flex align-center justify-space-between mb-4">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            aria-label="Предыдущий месяц"
            @click="prevMonth"
          />
          <div class="text-center">
            <p class="text-subtitle-1 font-weight-bold mb-0">
              {{ monthLabel }}
            </p>
            <button class="calendar__today-link" type="button" @click="goToday">
              Сегодня
            </button>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            aria-label="Следующий месяц"
            @click="nextMonth"
          />
        </div>

        <div class="calendar__weekdays">
          <span v-for="w in WEEKDAYS" :key="w" class="calendar__weekday">{{
            w
          }}</span>
        </div>

        <div class="calendar__grid">
          <button
            v-for="cell in cells"
            :key="cell.date"
            type="button"
            class="calendar__cell"
            :class="{
              'calendar__cell--muted': !cell.inMonth,
              'calendar__cell--busy': cell.count > 0,
              'calendar__cell--today': cell.isToday,
              'calendar__cell--selected': cell.date === selectedDate,
            }"
            :aria-label="`${cell.date}: броней ${cell.count}`"
            :aria-pressed="cell.date === selectedDate"
            :disabled="!cell.count"
            @click="selectDay(cell)"
          >
            <span class="calendar__day">{{ cell.day }}</span>
            <span v-if="cell.count" class="calendar__badge">{{
              cell.count
            }}</span>
          </button>
        </div>

        <div class="calendar__legend mt-4">
          <span class="calendar__legend-item">
            <span class="calendar__dot calendar__dot--busy" /> есть брони
          </span>
          <span class="calendar__legend-item">
            <span class="calendar__dot calendar__dot--today" /> сегодня
          </span>
        </div>
      </div>

      <section class="business-panel calendar-details">
        <template v-if="selectedDate">
          <h2 class="text-subtitle-1 font-weight-semibold mb-3">
            Брони на {{ selectedLabel }}
          </h2>
          <div class="d-flex flex-column ga-3">
            <div
              v-for="b in selectedBookings"
              :key="b._id"
              class="gv-card-elevated pa-4"
            >
              <div
                class="d-flex flex-wrap align-center justify-space-between ga-2 mb-1"
              >
                <p class="font-weight-semibold mb-0">
                  {{ b.listingId?.title || "Объявление" }}
                </p>
                <StatusChip :status="b.status" type="booking" />
              </div>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ renterLine(b) }} · {{ b.dateFrom?.slice(0, 10) }} —
                {{ b.dateTo?.slice(0, 10) }} · {{ b.units }} шт.
              </p>
            </div>
          </div>
        </template>
        <template v-else
          ><h2 class="text-h6 mb-3">Брони по дням</h2>
          <p class="business-muted mb-0">
            Выберите выделенный день в календаре, чтобы увидеть оборудование и
            арендаторов.
          </p></template
        >
        <p
          v-if="selectedDate && !selectedBookings.length"
          class="business-muted mb-0"
        >
          На выбранный день броней нет.
        </p>
      </section>
    </div>
    <EmptyState
      v-if="!isLoading && !loadError && !activeBookings.length"
      class="mt-5"
      title="Броней пока нет"
      description="Когда появятся брони по вашим объявлениям, они отобразятся в календаре."
    />
  </div>
</template>

<style scoped>
.calendar-workspace {
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 1fr);
}
.calendar-details h2 {
  font-size: 18px !important;
}
.calendar-board {
  padding: 20px;
}
@media (max-width: 1200px) {
  .calendar-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 600px) {
  .calendar-board {
    padding: 12px 8px;
  }
  .calendar__grid {
    gap: 3px !important;
  }
}

.calendar__today-link {
  font-size: 12px;
  color: var(--gv-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
}

.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar__weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--gv-text-secondary);
  padding-bottom: 6px;
}

.calendar__cell {
  position: relative;
  min-height: 76px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px 10px;
  border: 1px solid var(--gv-border-light);
  border-radius: 6px;
  background: var(--gv-card-bg);
  cursor: default;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

@media (max-width: 600px) {
  .calendar__cell {
    min-height: 52px;
    padding: 6px;
  }
}

.calendar__cell--muted {
  opacity: 0.4;
}

.calendar__cell--busy {
  background: var(--gv-primary-soft-bg);
  border-color: var(--gv-primary-soft-border);
  cursor: pointer;
}

.calendar__cell--busy:hover {
  border-color: var(--gv-primary);
}

.calendar__cell--today {
  border-color: var(--gv-primary);
  border-width: 2px;
}

.calendar__cell--selected {
  background: rgba(255, 102, 0, 0.16);
  border-color: var(--gv-primary);
}

.calendar__day {
  font-size: 13px;
  color: var(--gv-text);
}

.calendar__badge {
  position: absolute;
  right: 6px;
  bottom: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--gv-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar__legend {
  display: flex;
  gap: 16px;
}

.calendar__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gv-text-secondary);
}

.calendar__dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  display: inline-block;
}

.calendar__dot--busy {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
}

.calendar__dot--today {
  border: 2px solid var(--gv-primary);
}
</style>
