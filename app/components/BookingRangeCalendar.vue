<script setup lang="ts">
import dayjs from "dayjs";
import type { IBookedRange } from "~/types/rental";

interface ICalendarDayCell {
  iso: string;
  dayLabel: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

const props = defineProps<{
  startDate: string;
  endDate: string;
  minRentalDays: number;
  busyRanges: IBookedRange[];
  canStartDate: (dateIso: string) => boolean;
  isRangeAvailable: (startIso: string, endIso: string) => boolean;
  isDateOverCapacity: (dateIso: string) => boolean;
}>();

const emit = defineEmits<{
  (
    e: "update:range",
    payload: { startDate: string; endDate: string; rentalDays: number },
  ): void;
  (e: "blocked-click", message: string): void;
  (e: "start-picked", dateIso: string): void;
}>();
const isPickingEnd = ref(false);

function safeMonthFromIso(iso: string): dayjs.Dayjs {
  if (!iso) return dayjs().startOf("month");
  const parsed = dayjs(iso);
  return parsed.isValid() ? parsed.startOf("month") : dayjs().startOf("month");
}

const monthCursor = ref(safeMonthFromIso(props.startDate));

const monthTitleFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

const monthTitle = computed(() => {
  const value = monthTitleFormatter.format(monthCursor.value.toDate());
  return value.replace(/^./, (x) => x.toUpperCase());
});

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const dayCells = computed<ICalendarDayCell[]>(() => {
  const startOfMonth = monthCursor.value.startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();
  const leading = (startOfMonth.day() + 6) % 7;
  const cells: ICalendarDayCell[] = [];

  for (let i = leading; i > 0; i -= 1) {
    const date = startOfMonth.subtract(i, "day");
    cells.push({
      iso: date.format("YYYY-MM-DD"),
      dayLabel: date.date(),
      inCurrentMonth: false,
      isToday: date.isSame(dayjs(), "day"),
    });
  }

  for (let i = 1; i <= daysInMonth; i += 1) {
    const date = startOfMonth.date(i);
    cells.push({
      iso: date.format("YYYY-MM-DD"),
      dayLabel: i,
      inCurrentMonth: true,
      isToday: date.isSame(dayjs(), "day"),
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 35) {
    const date = startOfMonth.add(cells.length - leading - daysInMonth + 1, "day");
    cells.push({
      iso: date.format("YYYY-MM-DD"),
      dayLabel: date.date(),
      inCurrentMonth: false,
      isToday: date.isSame(dayjs(), "day"),
    });
  }

  return cells;
});

function prevMonth(): void {
  monthCursor.value = monthCursor.value.subtract(1, "month");
}

function nextMonth(): void {
  monthCursor.value = monthCursor.value.add(1, "month");
}

function isBusyDay(dateIso: string): boolean {
  return props.isDateOverCapacity(dateIso);
}

function canPickupOnDate(dateIso: string): boolean {
  return props.canStartDate(dateIso);
}

function isInSelectedRange(dateIso: string): boolean {
  if (!props.startDate || !props.endDate) return false;
  const date = dayjs(dateIso);
  return (
    !date.isBefore(dayjs(props.startDate), "day") &&
    !date.isAfter(dayjs(props.endDate), "day")
  );
}

function isRangeStart(dateIso: string): boolean {
  return !!props.startDate && dateIso === props.startDate;
}

function isRangeEnd(dateIso: string): boolean {
  return !!props.endDate && dateIso === props.endDate;
}

function isSuggestedEndDate(dateIso: string): boolean {
  if (!isPickingEnd.value || !props.startDate || !!props.endDate) return false;
  const suggested = dayjs(props.startDate).add(props.minRentalDays, "day").format("YYYY-MM-DD");
  return dateIso === suggested;
}

function onDateClick(cell: ICalendarDayCell): void {
  if (!cell.inCurrentMonth) return;
  const dateIso = cell.iso;
  const clicked = dayjs(dateIso);
  if (!clicked.isValid()) return;

  if (!isPickingEnd.value || !props.startDate) {
    if (!props.canStartDate(dateIso)) return;
    emit("start-picked", dateIso);
    isPickingEnd.value = true;
    return;
  }

  const minEndDate = dayjs(props.startDate).add(props.minRentalDays, "day");
  const normalizedEnd = clicked.isBefore(minEndDate, "day") ? minEndDate : clicked;
  const normalizedEndIso = normalizedEnd.format("YYYY-MM-DD");
  if (!props.isRangeAvailable(props.startDate, normalizedEndIso)) {
    // Если конец диапазона упирается в занятость, пробуем начать новый диапазон с выбранной даты.
    if (props.canStartDate(dateIso)) {
      const restartMinEndIso = clicked.add(props.minRentalDays, "day").format("YYYY-MM-DD");
      if (props.isRangeAvailable(dateIso, restartMinEndIso)) {
        emit("start-picked", dateIso);
        isPickingEnd.value = true;
        return;
      }
    }
    emit(
      "blocked-click",
      "Этот период пересекается с занятыми датами. Выберите другой диапазон.",
    );
    return;
  }
  const rentalDays = normalizedEnd.diff(dayjs(props.startDate), "day");
  emit("update:range", {
    startDate: props.startDate,
    endDate: normalizedEndIso,
    rentalDays,
  });
  isPickingEnd.value = false;
}

watch(
  () => props.startDate,
  (value) => {
    monthCursor.value = safeMonthFromIso(value);
  },
);

watch(
  () => [props.startDate, props.endDate] as const,
  ([startDate, endDate]) => {
    if (!startDate || !!endDate) {
      isPickingEnd.value = false;
    }
  },
);
</script>

<template>
  <div class="range-calendar gv-card-elevated rounded-lg pa-4 mb-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="prevMonth" />
      <p class="text-body-2 font-weight-semibold mb-0">{{ monthTitle }}</p>
      <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="nextMonth" />
    </div>

    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-chip size="small" color="primary" variant="tonal">
        Начало: {{ props.startDate ? dayjs(props.startDate).format("DD.MM.YYYY") : "не выбран" }}
      </v-chip>
      <v-chip size="small" color="primary" variant="tonal">
        <span :class="{
          'range-calendar__pick-end-hint': isPickingEnd && props.startDate && !props.endDate,
        }">
          Конец:
          {{
            props.endDate
              ? dayjs(props.endDate).format("DD.MM.YYYY")
              : isPickingEnd && props.startDate
                ? "выберите..."
                : "не выбран"
          }}
        </span>
      </v-chip>
    </div>

    <div class="range-calendar__grid mb-2">
      <div v-for="weekday in weekdayLabels" :key="weekday"
        class="range-calendar__weekday text-caption text-medium-emphasis">
        {{ weekday }}
      </div>
      <button v-for="cell in dayCells" :key="cell.iso" type="button" class="range-calendar__day" :class="{
        'range-calendar__day--outside': !cell.inCurrentMonth,
        'range-calendar__day--today': cell.isToday,
        'range-calendar__day--can-pickup': cell.inCurrentMonth && canPickupOnDate(cell.iso),
        'range-calendar__day--cannot-pickup': cell.inCurrentMonth && !canPickupOnDate(cell.iso),
        'range-calendar__day--busy': cell.inCurrentMonth && isBusyDay(cell.iso),
        'range-calendar__day--in-range': cell.inCurrentMonth && isInSelectedRange(cell.iso),
        'range-calendar__day--start': cell.inCurrentMonth && isRangeStart(cell.iso),
        'range-calendar__day--end': cell.inCurrentMonth && isRangeEnd(cell.iso),
        'range-calendar__day--suggested-end': cell.inCurrentMonth && isSuggestedEndDate(cell.iso),
      }" @click="onDateClick(cell)">
        <span>{{ cell.inCurrentMonth ? cell.dayLabel : "" }}</span>
        <span v-if="cell.inCurrentMonth && isRangeStart(cell.iso)" class="range-calendar__edge-label">
          Начало
        </span>
        <span v-if="cell.inCurrentMonth && isRangeEnd(cell.iso)" class="range-calendar__edge-label">
          Конец
        </span>
      </button>
    </div>

    <div class="d-flex flex-wrap ga-3 text-caption text-medium-emphasis">
      <span class="d-flex align-center ga-1"><span class="legend legend--pickup-ok" /> можно взять</span>
      <span class="d-flex align-center ga-1"><span class="legend legend--pickup-no" /> нельзя взять</span>
      <span class="d-flex align-center ga-1"><span class="legend legend--busy" /> превышение</span>
      <span class="d-flex align-center ga-1"><span class="legend legend--range" /> выбранный диапазон</span>
      <span class="d-flex align-center ga-1"><span class="legend legend--start" /> начало/конец</span>
    </div>
  </div>
</template>

<style scoped>
.range-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.range-calendar__weekday {
  text-align: center;
}

.range-calendar__day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  min-height: 36px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.16s ease,
    box-shadow 0.2s ease;
}

.range-calendar__day:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.range-calendar__day--outside {
  opacity: 0.45;
}

.range-calendar__day--today {
  border-color: var(--gv-primary);
}

.range-calendar__day--can-pickup {
  box-shadow: inset 0 0 0 1px #81c784;
}

.range-calendar__day--cannot-pickup {
  background: #f5f5f5;
  color: #8d8d8d;
}

.range-calendar__day--busy {
  background: #ffebee;
  color: #9a1c1c;
}

.range-calendar__day--in-range {
  background: #e3f2fd;
  border-color: #90caf9;
  animation: rangeFadeIn 0.22s ease;
}

.range-calendar__day--start,
.range-calendar__day--end {
  background: var(--gv-primary);
  border-color: var(--gv-primary);
  color: #fff;
  font-weight: 600;
  animation: edgePopIn 0.2s ease;
}

.range-calendar__day--suggested-end {
  border-color: #42a5f5;
  animation: suggestedPulse 1.2s ease-in-out infinite;
}

.range-calendar__edge-label {
  position: absolute;
  right: 4px;
  bottom: 2px;
  font-size: 9px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.9;
}

.range-calendar__pick-end-hint {
  font-size: 12px;
  font-weight: 700;
  color: #ef6c00;
  animation: pickEndPulse 1s ease-in-out infinite;
}

.legend {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.legend--busy {
  background: #ef5350;
}

.legend--pickup-ok {
  background: #4caf50;
}

.legend--pickup-no {
  background: #bdbdbd;
}

.legend--range {
  background: #90caf9;
}

.legend--start {
  background: var(--gv-primary);
}

@keyframes rangeFadeIn {
  from {
    background: #ffffff;
  }

  to {
    background: #e3f2fd;
  }
}

@keyframes edgePopIn {
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 0 rgba(25, 118, 210, 0);
  }

  70% {
    transform: scale(1.03);
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.12);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(25, 118, 210, 0);
  }
}

@keyframes suggestedPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 165, 245, 0.45);
    transform: scale(1);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(66, 165, 245, 0);
    transform: scale(1.02);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(66, 165, 245, 0);
    transform: scale(1);
  }
}

@keyframes pickEndPulse {
  0% {
    opacity: 0.55;
    transform: translateX(0);
  }

  50% {
    opacity: 1;
    transform: translateX(2px);
  }

  100% {
    opacity: 0.55;
    transform: translateX(0);
  }
}
</style>
