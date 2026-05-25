/** День недели: 0 = понедельник … 6 = воскресенье */
export interface IWeekdayAvailability {
  day: number;
  enabled: boolean;
  allDay: boolean;
  timeFrom: string;
  timeTo: string;
}

export const ALL_DAY_FROM = "00:00";
export const ALL_DAY_TO = "23:59";

export function isAllDayTimes(timeFrom: string, timeTo: string): boolean {
  return timeFrom === ALL_DAY_FROM && (timeTo === ALL_DAY_TO || timeTo === "24:00");
}

export const WEEKDAYS = [
  { day: 0, short: "Пн", full: "Понедельник" },
  { day: 1, short: "Вт", full: "Вторник" },
  { day: 2, short: "Ср", full: "Среда" },
  { day: 3, short: "Чт", full: "Четверг" },
  { day: 4, short: "Пт", full: "Пятница" },
  { day: 5, short: "Сб", full: "Суббота" },
  { day: 6, short: "Вс", full: "Воскресенье" },
] as const;

const WEEKLY_PREFIX = "wd:";

export function createDefaultWeekSchedule(): IWeekdayAvailability[] {
  return WEEKDAYS.map((d) => ({
    day: d.day,
    enabled: d.day < 5,
    allDay: false,
    timeFrom: "09:00",
    timeTo: "18:00",
  }));
}

function parseWeeklySlot(value: string): { day: number; time: string } | null {
  if (!value?.startsWith(WEEKLY_PREFIX)) return null;
  const parts = value.split(":");
  if (parts.length < 3) return null;
  const day = Number(parts[1]);
  const time = parts.slice(2).join(":");
  if (Number.isNaN(day) || day < 0 || day > 6 || !time) return null;
  return { day, time };
}

export function scheduleToCalendarRanges(
  schedule: IWeekdayAvailability[],
): Array<{ from: string; to: string }> {
  return schedule
    .filter((s) => s.enabled && s.timeFrom && s.timeTo)
    .map((s) => ({
      from: `${WEEKLY_PREFIX}${s.day}:${s.timeFrom}`,
      to: `${WEEKLY_PREFIX}${s.day}:${s.timeTo}`,
    }));
}

export function calendarRangesToSchedule(
  ranges: Array<{ from: string; to: string }>,
): IWeekdayAvailability[] {
  const base = createDefaultWeekSchedule().map((row) => ({
    ...row,
    enabled: false,
  }));

  for (const range of ranges) {
    const from = parseWeeklySlot(range.from);
    const to = parseWeeklySlot(range.to);
    if (!from || !to || from.day !== to.day) continue;
    const row = base.find((r) => r.day === from.day);
    if (row) {
      row.enabled = true;
      row.timeFrom = from.time;
      row.timeTo = to.time === "24:00" ? ALL_DAY_TO : to.time;
      row.allDay = isAllDayTimes(row.timeFrom, row.timeTo);
    }
  }

  return base;
}

export function formatAvailabilityRange(from: string, to: string): string {
  const fromSlot = parseWeeklySlot(from);
  const toSlot = parseWeeklySlot(to);
  if (fromSlot && toSlot && fromSlot.day === toSlot.day) {
    const label = WEEKDAYS.find((d) => d.day === fromSlot.day)?.full ?? "";
    if (isAllDayTimes(fromSlot.time, toSlot.time)) {
      return `${label}: весь день`;
    }
    return `${label}: ${fromSlot.time} — ${toSlot.time}`;
  }
  return `${from} — ${to}`;
}

/** Доля суток для полоски графика (0–100). */
export function timeToPercent(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return Math.min(100, Math.max(0, ((h * 60 + m) / (24 * 60)) * 100));
}

export function availabilityBarStyle(
  timeFrom: string,
  timeTo: string,
  allDay = false,
): { left: string; width: string } {
  if (allDay || isAllDayTimes(timeFrom, timeTo)) {
    return { left: "0%", width: "100%" };
  }
  const start = timeToPercent(timeFrom);
  let end = timeToPercent(timeTo);
  if (end <= start) end = Math.min(100, start + 5);
  return {
    left: `${start}%`,
    width: `${end - start}%`,
  };
}
