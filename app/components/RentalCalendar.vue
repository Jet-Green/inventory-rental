<script setup lang="ts">
import dayjs from "dayjs";
import type { IAvailabilityRange } from "~/types/rental";
import type { IBookedRange } from "~/types/rental";
import { formatAvailabilityRange } from "~/utils/listingAvailability";

const props = withDefaults(
  defineProps<{
  ranges: IAvailabilityRange[];
    busyRanges?: IBookedRange[];
    busyLoading?: boolean;
  }>(),
  {
    busyLoading: false,
  },
);

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
});

const busyDataEnabled = computed(
  () => Array.isArray(props.busyRanges) || !!props.busyLoading,
);

const busyRangesSorted = computed(() => {
  const ranges = props.busyRanges || [];
  return [...ranges].sort((a, b) => dayjs(a.dateFrom).valueOf() - dayjs(b.dateFrom).valueOf());
});

const next14Days = computed(() =>
  Array.from({ length: 14 }, (_, index) => {
    const date = dayjs().add(index, "day");
    const iso = date.format("YYYY-MM-DD");
    return {
      iso,
      label: index === 0 ? "Сегодня" : dateFormatter.format(date.toDate()),
    };
  }),
);

function isDayBooked(dayIso: string): boolean {
  const dayStart = dayjs(dayIso).startOf("day");
  const dayEnd = dayjs(dayIso).endOf("day");
  return busyRangesSorted.value.some((range) => {
    const from = dayjs(range.dateFrom);
    const to = dayjs(range.dateTo);
    if (!from.isValid() || !to.isValid()) return false;
    return !dayEnd.isBefore(from) && !dayStart.isAfter(to);
  });
}

function formatBookedRange(range: IBookedRange): string {
  const from = dayjs(range.dateFrom);
  const to = dayjs(range.dateTo);
  const fromLabel = from.isValid() ? from.format("DD.MM.YYYY HH:mm") : range.dateFrom;
  const toLabel = to.isValid() ? to.format("DD.MM.YYYY HH:mm") : range.dateTo;
  return `${fromLabel} — ${toLabel}`;
}

function bookingStatusLabel(status: IBookedRange["status"]): string {
  return status === "confirmed" ? "Подтверждено" : "Ожидает подтверждения";
}

function bookingStatusColor(status: IBookedRange["status"]): string {
  return status === "confirmed" ? "error" : "warning";
}
</script>

<template>
  <v-card flat class="pa-4">
    <h3 class="mb-3">График доступности</h3>
    <v-table v-if="ranges?.length" density="compact">
      <thead>
        <tr>
          <th>Когда доступно</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="range in ranges" :key="`${range.from}-${range.to}`">
          <td>{{ formatAvailabilityRange(range.from, range.to) }}</td>
          <td>
            <v-chip :color="range.isBooked ? 'red' : 'green'" size="small" label>
              {{ range.isBooked ? "Занято" : "Свободно" }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
    <p v-else class="text-caption text-medium-emphasis mb-0">
      Расписание не задано
    </p>

    <div v-if="busyDataEnabled" class="mt-4">
      <p class="text-body-2 font-weight-medium mb-2">Занятость на ближайшие 14 дней</p>
      <div class="d-flex flex-wrap ga-2 mb-2">
        <div
          v-for="day in next14Days"
          :key="day.iso"
          class="calendar-day-pill px-2 py-1 rounded"
          :class="isDayBooked(day.iso) ? 'calendar-day-pill--booked' : 'calendar-day-pill--free'"
          :title="`${day.label}: ${isDayBooked(day.iso) ? 'занято' : 'свободно'}`"
        >
          {{ day.label }}
        </div>
      </div>
      <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
        <span class="d-flex align-center ga-1">
          <span class="legend-dot legend-dot--free" /> свободно
        </span>
        <span class="d-flex align-center ga-1">
          <span class="legend-dot legend-dot--busy" /> занято
        </span>
      </div>
    </div>

    <div v-if="busyDataEnabled" class="mt-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <p class="text-body-2 font-weight-medium mb-0">Фактические занятые периоды</p>
        <v-progress-circular v-if="busyLoading" indeterminate size="18" width="2" color="primary" />
      </div>
      <v-table v-if="busyRangesSorted.length" density="compact">
        <thead>
          <tr>
            <th>Период</th>
            <th>Статус</th>
            <th>Ед.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="range in busyRangesSorted" :key="range.bookingId">
            <td>{{ formatBookedRange(range) }}</td>
            <td>
              <v-chip :color="bookingStatusColor(range.status)" size="small" label>
                {{ bookingStatusLabel(range.status) }}
              </v-chip>
            </td>
            <td>{{ range.units }}</td>
          </tr>
        </tbody>
      </v-table>
      <p v-else-if="!busyLoading" class="text-caption text-medium-emphasis mb-0">
        На выбранное оборудование пока нет активных броней.
      </p>
    </div>
  </v-card>
</template>

<style scoped>
.calendar-day-pill {
  font-size: 12px;
  line-height: 1.2;
  border: 1px solid transparent;
}

.calendar-day-pill--free {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #c8e6c9;
}

.calendar-day-pill--booked {
  background: #ffebee;
  color: #b71c1c;
  border-color: #ffcdd2;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.legend-dot--free {
  background: #66bb6a;
}

.legend-dot--busy {
  background: #ef5350;
}
</style>
