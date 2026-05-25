<script setup lang="ts">
import {
  ALL_DAY_FROM,
  ALL_DAY_TO,
  WEEKDAYS,
  availabilityBarStyle,
  isAllDayTimes,
  type IWeekdayAvailability,
} from "~/utils/listingAvailability";

const schedule = defineModel<IWeekdayAvailability[]>({ required: true });

function rowForDay(day: number): IWeekdayAvailability {
  const row = schedule.value?.find((r) => r.day === day);
  if (row) {
    return {
      ...row,
      allDay: row.allDay ?? isAllDayTimes(row.timeFrom, row.timeTo),
    };
  }
  return {
    day,
    enabled: false,
    allDay: false,
    timeFrom: "09:00",
    timeTo: "18:00",
  };
}

function updateRow(day: number, patch: Partial<IWeekdayAvailability>): void {
  const list = [...(schedule.value || [])];
  const idx = list.findIndex((r) => r.day === day);
  const current = idx >= 0 ? list[idx] : rowForDay(day);
  const next = { ...current, ...patch };
  if (idx >= 0) {
    list[idx] = next;
  } else {
    list.push(next);
  }
  list.sort((a, b) => a.day - b.day);
  schedule.value = list;
}

function setTimeFrom(day: number, value: string): void {
  updateRow(day, { timeFrom: value, allDay: false });
}

function setTimeTo(day: number, value: string): void {
  updateRow(day, { timeTo: value, allDay: false });
}

function setAllDay(day: number, allDay: boolean): void {
  if (allDay) {
    updateRow(day, {
      allDay: true,
      timeFrom: ALL_DAY_FROM,
      timeTo: ALL_DAY_TO,
    });
    return;
  }
  const row = rowForDay(day);
  updateRow(day, {
    allDay: false,
    timeFrom: row.timeFrom === ALL_DAY_FROM ? "09:00" : row.timeFrom,
    timeTo: row.timeTo === ALL_DAY_TO ? "18:00" : row.timeTo,
  });
}

const enabledCount = computed(
  () => (schedule.value || []).filter((r) => r.enabled).length,
);
</script>

<template>
  <div class="availability-picker">
    <p class="text-body-2 text-medium-emphasis mb-4">
      Отметьте дни и время, когда когда вам удобно сдавать в аренду, это ваш график работы.
    </p>

    <div class="availability-picker__chart gv-card-elevated pa-4 mb-6">
      <v-row class="text-caption text-medium-emphasis mb-1 px-1">
        <v-col cols="2" />
        <v-col class="d-flex justify-space-between">
          <span>00:00</span>
          <span>12:00</span>
          <span>24:00</span>
        </v-col>
      </v-row>
      <v-row v-for="wd in WEEKDAYS" :key="wd.day" align="center" class="mb-1" no-gutters>
        <v-col cols="2" class="text-caption font-weight-semibold availability-picker__day-short">
          {{ wd.short }}
        </v-col>
        <v-col cols="10">
          <div class="availability-picker__track">
            <div v-if="rowForDay(wd.day).enabled" class="availability-picker__bar" :style="availabilityBarStyle(
              rowForDay(wd.day).timeFrom,
              rowForDay(wd.day).timeTo,
              rowForDay(wd.day).allDay,
            )
              " />
          </div>
        </v-col>
      </v-row>
      <p v-if="!enabledCount" class="text-caption text-medium-emphasis mt-2 mb-0">
        Выберите хотя бы один день
      </p>
    </div>

    <div class="availability-picker__days">
      <div v-for="wd in WEEKDAYS" :key="`edit-${wd.day}`" class="availability-picker__day-card rounded-lg pa-3 mb-3"
        :class="{ 'availability-picker__day-card--off': !rowForDay(wd.day).enabled }">
        <v-row align="center" dense>
          <v-col cols="12" md="5">
            <v-switch :model-value="rowForDay(wd.day).enabled" color="primary" density="compact" hide-details
              :label="wd.full" @update:model-value="updateRow(wd.day, { enabled: !!$event })" />
          </v-col>
          <v-col cols="12" sm="6" md="2" class="d-flex align-center">
            <v-checkbox :model-value="rowForDay(wd.day).allDay" label="Весь день" color="primary" density="compact"
              hide-details :disabled="!rowForDay(wd.day).enabled" @update:model-value="setAllDay(wd.day, !!$event)" />
          </v-col>
          <v-col cols="6" md="2">
            <TimeFieldRu :model-value="rowForDay(wd.day).timeFrom" label="С"
              :disabled="!rowForDay(wd.day).enabled || rowForDay(wd.day).allDay"
              @update:model-value="setTimeFrom(wd.day, $event)" />
          </v-col>
          <v-col cols="6" md="3">
            <TimeFieldRu :model-value="rowForDay(wd.day).timeTo" label="До"
              :disabled="!rowForDay(wd.day).enabled || rowForDay(wd.day).allDay"
              @update:model-value="setTimeTo(wd.day, $event)" />
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<style scoped>
.availability-picker__day-short {
  color: rgba(0, 0, 0, 0.7);
}

.availability-picker__track {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background: #f0f0f0;
  overflow: hidden;
}

.availability-picker__bar {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--gv-primary), #ffb347);
  min-width: 4px;
}

.availability-picker__day-card {
  border: 1px solid #eee;
  background: #fafafa;
}

.availability-picker__day-card--off {
  opacity: 0.65;
}
</style>
