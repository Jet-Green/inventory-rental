<script setup lang="ts">
import dayjs from "dayjs";
import BookingApi from "~/api/BookingApi";
import { useBooking } from "~/composables/useBooking";
import { useAuthProfile } from "~/composables/useAuthProfile";
import { useRentalItem } from "~/composables/useRentalItem";
import { useRole } from "~/composables/useRole";
import { listingToDraft, useBookingDraft } from "~/composables/useBookingDraft";
import type { IBookedRange } from "~/types/rental";

const props = defineProps<{
  listingId: string;
}>();

const route = useRoute();
const router = useRouter();
const { currentListing, fetchListingById, isLoading } = useRentalItem();
const { isRenter, isAdmin } = useRole();
const { profile, fetchProfile, updateProfile } = useAuthProfile();
const { createBooking, isSubmitting } = useBooking();
const draft = useBookingDraft();
const busyRanges = ref<IBookedRange[]>([]);

const step = ref(1);
const stepError = ref("");

const period = reactive({
  dateFrom: "",
  dateTo: "",
  startDate: "",
  startTime: "",
  endDate: "",
  rentalDays: 0,
  units: 1,
});

const contacts = reactive({
  fullName: "",
  phone: "",
  email: "",
  agreeContract: false,
  agreePersonal: false,
});

const steps = [
  { n: 1, label: "Период" },
  { n: 2, label: "Проверка" },
  { n: 3, label: "Контакты" },
  { n: 4, label: "Оплата" },
];

const stepTitles: Record<number, string> = {
  1: "Выберите начало и срок аренды",
  2: "Проверьте параметры бронирования",
  3: "Укажите контактные данные",
  4: "Подтверждение и оплата",
};

const startCalendarOpen = ref(false);
const endCalendarOpen = ref(false);

interface IWorkingWindow {
  from: string;
  to: string;
}

function parseWeeklySlot(value: string): { day: number; time: string } | null {
  const match = value.match(/^wd:(\d):(\d{2}:\d{2})$/);
  if (!match) return null;
  const day = Number(match[1]);
  if (Number.isNaN(day) || day < 0 || day > 6) return null;
  return { day, time: match[2] };
}

function minuteOfDay(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function dateToWeekday(dateIso: string): number {
  // JS: 0 = вс, 1 = пн...; в расписании: 0 = пн ... 6 = вс
  return (dayjs(dateIso).day() + 6) % 7;
}

const dateLabelFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

function formatDateRu(dateIso: string, withYear = false): string {
  const parsed = dayjs(dateIso);
  if (!parsed.isValid()) return "";
  if (withYear) {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed.toDate());
  }
  return dateLabelFormatter.format(parsed.toDate());
}

const workingWindows = computed<Map<number, IWorkingWindow>>(() => {
  const map = new Map<number, IWorkingWindow>();
  for (const range of currentListing.value?.calendar || []) {
    if (range.isBooked) continue;
    const from = parseWeeklySlot(range.from);
    const to = parseWeeklySlot(range.to);
    if (!from || !to || from.day !== to.day) continue;

    const existing = map.get(from.day);
    if (!existing) {
      map.set(from.day, { from: from.time, to: to.time });
      continue;
    }

    if (minuteOfDay(from.time) < minuteOfDay(existing.from)) {
      existing.from = from.time;
    }
    if (minuteOfDay(to.time) > minuteOfDay(existing.to)) {
      existing.to = to.time;
    }
    map.set(from.day, existing);
  }
  return map;
});

function windowForDate(dateIso: string): IWorkingWindow | null {
  if (!dateIso) return null;
  return workingWindows.value.get(dateToWeekday(dateIso)) || null;
}

function canPickupOnDate(dateIso: string): boolean {
  return !!windowForDate(dateIso);
}

function buildTimeOptions(from: string, to: string): Array<{ title: string; value: string }> {
  const start = minuteOfDay(from);
  const end = minuteOfDay(to);
  if (end <= start) return [];

  const values: Array<{ title: string; value: string }> = [];
  for (let m = start; m <= end; m += 30) {
    const value = minutesToTime(m);
    values.push({ title: value, value });
  }

  if (values.length && values[values.length - 1]?.value !== to) {
    values.push({ title: to, value: to });
  }
  return values;
}

const startDateOptions = computed<Array<{ value: string; label: string }>>(() => {
  const options: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < 21 && options.length < 4; i += 1) {
    const dateIso = dayjs().add(i, "day").format("YYYY-MM-DD");
    if (!canPickupOnDate(dateIso)) continue;

    let label = formatDateRu(dateIso);
    if (i === 0) label = "Сегодня";
    if (i === 1) label = "Завтра";
    options.push({ value: dateIso, label });
  }

  if (period.startDate && !options.some((option) => option.value === period.startDate)) {
    options.unshift({
      value: period.startDate,
      label: formatDateRu(period.startDate),
    });
  }

  return options.slice(0, 4);
});

const selectedStartWindow = computed(() => windowForDate(period.startDate));

const startTimeOptions = computed(() => {
  const window = selectedStartWindow.value;
  if (!window) return [];
  return buildTimeOptions(window.from, window.to);
});

const minRentalDays = computed(() => currentListing.value?.minDays ?? 1);

const maxRentalDays = computed(() => Math.max(minRentalDays.value, 31));

const rentalDaysOptions = computed<Array<{ value: number; label: string }>>(() => {
  if (!period.startDate || !period.startTime) return [];
  const options: Array<{ value: number; label: string }> = [];
  const startFrom = minRentalDays.value;
  for (let i = 0; i < 4; i += 1) {
    const days = startFrom + i;
    if (days > maxRentalDays.value) break;
    options.push({
      value: days,
      label: `${days} дн.`,
    });
  }
  if (period.rentalDays && !options.some((option) => option.value === period.rentalDays)) {
    options.unshift({
      value: period.rentalDays,
      label: `${period.rentalDays} дн.`,
    });
  }

  return options.slice(0, 4);
});

const startDateDisplay = computed(() =>
  period.startDate ? formatDateRu(period.startDate, true) : "",
);

const endDateDisplay = computed(() =>
  period.endDate ? formatDateRu(period.endDate, true) : "",
);

function selectStartDate(dateIso: string): void {
  if (!dateIso || !canPickupOnDate(dateIso)) return;
  period.startDate = dateIso;
  startCalendarOpen.value = false;
}

function selectEndDate(dateIso: string): void {
  if (!dateIso || !allowedEndDate(dateIso) || !period.startDate) return;
  const diff = dayjs(dateIso).diff(dayjs(period.startDate), "day");
  if (diff < minRentalDays.value || diff > maxRentalDays.value) return;
  period.rentalDays = diff;
  endCalendarOpen.value = false;
}

function normalizePickerDate(value: unknown): string {
  if (!value) return "";
  const parsed = dayjs(String(value));
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DD");
}

function allowedStartDate(dateIso: string): boolean {
  return canPickupOnDate(dateIso);
}

function allowedEndDate(dateIso: string): boolean {
  if (!period.startDate) return false;
  const diff = dayjs(dateIso).diff(dayjs(period.startDate), "day");
  return diff >= minRentalDays.value && diff <= maxRentalDays.value;
}

async function fetchBusyRangesByListingId(id: string): Promise<void> {
  if (!id) {
    busyRanges.value = [];
    return;
  }
  try {
    const response = await BookingApi.busyByListing(id);
    busyRanges.value = response.busyRanges || [];
  } catch {
    busyRanges.value = [];
  }
}

onMounted(async () => {
  const q = Number(route.query.step);
  if (q >= 1 && q <= 4) step.value = q;

  await Promise.all([fetchListingById(props.listingId), fetchProfile(), fetchBusyRangesByListingId(props.listingId)]);

  if (profile.value) {
    contacts.fullName = profile.value.fullName || "";
    contacts.phone = profile.value.phone || "";
    contacts.email = profile.value.email || "";
  }

  const d = draft.value;
  if (d?.listingId === props.listingId) {
    period.dateFrom = d.dateFrom;
    period.dateTo = d.dateTo;
    const start = dayjs(d.dateFrom);
    if (start.isValid()) {
      period.startDate = start.format("YYYY-MM-DD");
      period.startTime = start.format("HH:mm");
    }
    const end = dayjs(d.dateTo);
    if (end.isValid()) {
      period.endDate = end.format("YYYY-MM-DD");
      if (period.startDate) {
        const diff = end.diff(dayjs(period.startDate), "day");
        period.rentalDays = diff > 0 ? diff : 0;
      }
    }
    period.units = d.units;
  }
});

watch(
  () => props.listingId,
  (id) => {
    if (!id) return;
    void fetchListingById(id);
    void fetchBusyRangesByListingId(id);
  },
);

const pickupLabel = computed(() => {
  const l = currentListing.value;
  if (!l) return "";
  if (l.pickupType === "pickup") return "самовывоз";
  if (l.pickupType === "delivery") return "доставка";
  return "самовывоз или доставка";
});

const bookingDays = computed(() => {
  if (!period.startDate || !period.rentalDays) return 0;
  return period.rentalDays > 0 ? period.rentalDays : 0;
});

const derivedDateFrom = computed(() => {
  if (!period.startDate || !period.startTime) return "";
  const parsed = dayjs(`${period.startDate}T${period.startTime}`);
  return parsed.isValid() ? parsed.toISOString() : "";
});

const derivedDateTo = computed(() => {
  if (!period.startDate || !bookingDays.value) return "";
  return dayjs(period.startDate).add(bookingDays.value, "day").format("YYYY-MM-DD");
});

const reservedUnitsForPeriod = computed(() => {
  if (!derivedDateFrom.value || !derivedDateTo.value) return 0;
  const requestedFromTs = dayjs(derivedDateFrom.value).valueOf();
  const requestedToTs = dayjs(derivedDateTo.value).valueOf();
  if (!Number.isFinite(requestedFromTs) || !Number.isFinite(requestedToTs)) return 0;
  return busyRanges.value.reduce((sum, range) => {
    const bookingFromTs = dayjs(range.dateFrom).valueOf();
    const bookingToTs = dayjs(range.dateTo).valueOf();
    if (!Number.isFinite(bookingFromTs) || !Number.isFinite(bookingToTs)) return sum;
    const overlaps = bookingFromTs < requestedToTs && bookingToTs > requestedFromTs;
    return overlaps ? sum + range.units : sum;
  }, 0);
});

const unitsAvailableForPeriod = computed(() => {
  const total = currentListing.value?.unitsTotal ?? 0;
  return Math.max(0, total - reservedUnitsForPeriod.value);
});

const rentalSubtotal = computed(() => {
  const l = currentListing.value;
  if (!l || !bookingDays.value) return 0;
  return bookingDays.value * l.pricePerDay * period.units;
});

const deliveryFee = computed(() =>
  pickupLabel.value.includes("доставк") ? 500 : 0,
);

const totalPrice = computed(() => rentalSubtotal.value + deliveryFee.value);

const selectionSummary = computed(() => {
  if (!period.startDate || !period.startTime || !endDateDisplay.value || !bookingDays.value) {
    return "Укажите дату и время начала, а также срок аренды";
  }
  return `${formatDateRu(period.startDate, true)}, ${period.startTime} — ${endDateDisplay.value} · ${bookingDays.value} дн. · ${period.units} шт.`;
});

const canStep1 = computed(
  () =>
    !!currentListing.value &&
    !!derivedDateFrom.value &&
    !!derivedDateTo.value &&
    !!period.startTime &&
    bookingDays.value > 0 &&
    period.units >= 1 &&
    period.units <= unitsAvailableForPeriod.value &&
    bookingDays.value >= (currentListing.value?.minDays ?? 1),
);

const canStep3 = computed(
  () =>
    contacts.fullName.trim().length > 0 &&
    contacts.phone.trim().length > 0 &&
    contacts.email.trim().length > 0,
);

const canPay = computed(
  () =>
    canStep1.value &&
    canStep3.value &&
    contacts.agreeContract &&
    contacts.agreePersonal &&
    (isRenter.value || isAdmin.value),
);

function syncDraft(): void {
  const l = currentListing.value;
  if (!l || !canStep1.value) return;
  draft.value = listingToDraft(
    l,
    {
      dateFrom: derivedDateFrom.value,
      dateTo: derivedDateTo.value,
      units: period.units,
    },
    pickupLabel.value,
  );
}

function validateStep(target: number): boolean {
  stepError.value = "";
  if (target > 1 && !canStep1.value) {
    const minDays = currentListing.value?.minDays ?? 1;
    const hasMinDaysViolation = bookingDays.value > 0 && bookingDays.value < minDays;
    const noUnitsLeftForPeriod = unitsAvailableForPeriod.value < 1;
    if (noUnitsLeftForPeriod) {
      stepError.value = "На выбранный период нет доступных единиц оборудования.";
      return false;
    }
    if (period.units > unitsAvailableForPeriod.value) {
      stepError.value = `На выбранный период доступно только ${unitsAvailableForPeriod.value} ед.`;
      return false;
    }
    stepError.value =
      hasMinDaysViolation
        ? `Минимальный срок аренды — ${minDays} дн.`
        : "Укажите корректный период аренды.";
    return false;
  }
  if (target > 3 && !canStep3.value) {
    stepError.value = "Заполните ФИО, телефон и e-mail.";
    return false;
  }
  if (target > 3 && !isRenter.value && !isAdmin.value) {
    stepError.value = "Оформление доступно для подтверждённого пользователя.";
    return false;
  }
  return true;
}

watch(
  () => period.startDate,
  (dateIso) => {
    if (!dateIso) {
      period.startTime = "";
      period.endDate = "";
      period.rentalDays = 0;
      return;
    }

    const available = startTimeOptions.value.map((x) => x.value);
    if (!available.includes(period.startTime)) {
      period.startTime = available[0] || "";
    }

    if (period.rentalDays < minRentalDays.value) {
      period.rentalDays = minRentalDays.value;
    }
    if (period.rentalDays > maxRentalDays.value) {
      period.rentalDays = maxRentalDays.value;
    }
  },
);

watch(
  () => period.startTime,
  (time) => {
    if (!period.startDate || !time) {
      period.dateFrom = "";
      return;
    }
    period.dateFrom = dayjs(`${period.startDate}T${time}`).toISOString();
  },
);

watch(
  () => [period.startDate, period.rentalDays] as const,
  ([startDate, rentalDays]) => {
    if (!startDate || !rentalDays) {
      period.endDate = "";
      period.dateTo = "";
      return;
    }
    const end = dayjs(startDate).add(rentalDays, "day").format("YYYY-MM-DD");
    period.endDate = end;
    period.dateTo = end;
  },
);

watch(
  () => period.rentalDays,
  (value) => {
    if (!period.startDate) return;
    const normalized = Number.isFinite(value) ? Math.trunc(value) : 0;
    const clamped = Math.min(maxRentalDays.value, Math.max(minRentalDays.value, normalized));
    if (clamped !== value) {
      period.rentalDays = clamped;
    }
  },
);

function goToStep(n: number): void {
  if (n > step.value && !validateStep(n)) return;
  if (n >= 2) syncDraft();
  step.value = n;
  void router.replace({ query: { ...route.query, step: String(n) } });
}

function nextStep(): void {
  goToStep(Math.min(4, step.value + 1));
}

function prevStep(): void {
  goToStep(Math.max(1, step.value - 1));
}

async function pay(): Promise<void> {
  if (!validateStep(4) || !canPay.value || !draft.value) return;
  stepError.value = "";
  await updateProfile({
    fullName: contacts.fullName,
    phone: contacts.phone,
    email: contacts.email,
  });
  await createBooking({
    listingId: draft.value.listingId,
    dateFrom: draft.value.dateFrom,
    dateTo: draft.value.dateTo,
    units: draft.value.units,
    acceptedPersonalData: contacts.agreePersonal,
  });
  draft.value = null;
  await navigateTo("/booking/success");
}
</script>

<template>
  <div class="booking-wizard px-4 px-sm-6 py-6 gv-page-wide">
    <div class="d-flex flex-wrap align-center ga-3 mb-2">
      <v-btn variant="text" color="primary" size="small" :to="`/rental-item/${listingId}`">
        ← К объявлению
      </v-btn>
    </div>

    <h1 class="gv-display text-h4 mb-1">Бронирование</h1>
    <p v-if="currentListing" class="text-body-2 text-medium-emphasis mb-4">
      {{ currentListing.title }}
    </p>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <template v-if="currentListing">
      <div class="d-flex flex-wrap ga-2 mb-6">
        <button v-for="s in steps" :key="s.n" type="button" class="step-pill text-caption px-3 py-2 rounded-lg border"
          :class="step === s.n ? 'step-pill--active' : 'step-pill--idle'" @click="goToStep(s.n)">
          {{ s.n }} {{ s.label }}
        </button>
      </div>

      <p class="text-body-1 font-weight-semibold mb-4">
        Шаг {{ step }} · {{ stepTitles[step] }}
      </p>

      <div v-show="step === 1" class="max-w-screen-md">
        <div class="mb-4">
          <p class="text-body-2 font-weight-medium mb-2">1) Дата начала</p>
          <div class="d-flex flex-wrap align-center ga-2 mb-2">
            <v-chip v-for="option in startDateOptions" :key="option.value"
              :color="period.startDate === option.value ? 'primary' : undefined"
              :variant="period.startDate === option.value ? 'flat' : 'outlined'" class="booking-wizard__date-chip"
              rounded="pill" label @click="selectStartDate(option.value)">
              {{ option.label }}
            </v-chip>
            <v-menu v-model="startCalendarOpen" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon="mdi-calendar-month-outline" variant="text" color="primary" size="small"
                  aria-label="Выбрать дату начала в календаре" />
              </template>
              <v-card>
                <v-date-picker :model-value="period.startDate || undefined" :allowed-dates="allowedStartDate"
                  color="primary" show-adjacent-months
                  @update:model-value="selectStartDate(normalizePickerDate($event))" />
              </v-card>
            </v-menu>
          </div>
        </div>

        <div v-if="period.startDate" class="mb-4">
          <p class="text-body-2 font-weight-medium mb-2">2) Выберите время начала аренды</p>
          <v-select v-model="period.startTime" :items="startTimeOptions" item-title="title" item-value="value"
            label="Время начала" variant="outlined" rounded="lg" hide-details />
          <p v-if="selectedStartWindow" class="text-caption text-medium-emphasis mt-2 mb-0">
            Доступно в этот день: {{ selectedStartWindow.from }} — {{ selectedStartWindow.to }}
          </p>
        </div>

        <div v-if="period.startDate && period.startTime" class="mb-3">
          <p class="text-body-2 font-weight-medium mb-2">3) Срок аренды</p>
          <div class="d-flex flex-wrap align-center ga-2 mb-2">
            <v-chip v-for="option in rentalDaysOptions" :key="option.value"
              :color="period.rentalDays === option.value ? 'primary' : undefined"
              :variant="period.rentalDays === option.value ? 'flat' : 'outlined'" class="booking-wizard__date-chip"
              rounded="pill" label @click="period.rentalDays = option.value">
              {{ option.label }}
            </v-chip>
            <v-menu v-model="endCalendarOpen" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon="mdi-calendar-month-outline" variant="text" color="primary" size="small"
                  aria-label="Выбрать дату окончания в календаре" />
              </template>
              <v-card>
                <v-date-picker :model-value="period.endDate || undefined" :allowed-dates="allowedEndDate"
                  :min="period.startDate || undefined" color="primary" show-adjacent-months
                  @update:model-value="selectEndDate(normalizePickerDate($event))" />
              </v-card>
            </v-menu>
          </div>
          <v-text-field v-model.number="period.rentalDays" type="number" :min="minRentalDays" :max="maxRentalDays"
            label="Срок аренды, дней" variant="outlined" rounded="lg" hide-details class="mb-2" />
          <p v-if="endDateDisplay" class="text-caption text-medium-emphasis mt-2 mb-0">
            Возврат: {{ endDateDisplay }}
          </p>
          <p class="text-caption text-medium-emphasis mt-1 mb-0">
            Минимальный срок аренды: {{ minRentalDays }} дн.
          </p>
        </div>

        <v-text-field v-model.number="period.units" label="Количество" type="number" :min="1"
          :max="Math.max(1, unitsAvailableForPeriod)" variant="outlined" rounded="lg" class="mb-1" hide-details />
        <p class="text-caption text-medium-emphasis mb-4">
          Доступно на выбранный период: {{ unitsAvailableForPeriod }} ед.
        </p>

        <div class="booking-wizard__total rounded-lg pa-4">
          <p class="text-caption mb-1 text-medium-emphasis">Предварительно</p>
          <p class="text-h5 gv-display text-primary mb-1">
            {{ new Intl.NumberFormat("ru-RU").format(rentalSubtotal) }} ₽
          </p>
          <p class="text-caption text-medium-emphasis mb-0">{{ selectionSummary }}</p>
          <p v-if="startDateDisplay" class="text-caption text-medium-emphasis mt-1 mb-0">
            Начало: {{ startDateDisplay }}<span v-if="period.startTime">, {{ period.startTime }}</span>
          </p>
        </div>
      </div>

      <div v-show="step === 2" class="max-w-screen-md">
        <div class="gv-card-elevated d-flex ga-4 pa-4 mb-4">
          <div class="booking-wizard__thumb rounded-lg"
            :class="{ 'booking-wizard__thumb--empty': !currentListing.photos?.[0] }">
            <v-img v-if="currentListing.photos?.[0]" :src="currentListing.photos[0]" cover height="90" width="120" />
          </div>
          <div>
            <p class="font-weight-semibold mb-1">{{ currentListing.title }}</p>
            <p class="text-caption text-medium-emphasis">
              {{ selectionSummary }}
            </p>
            <p class="text-caption text-medium-emphasis mt-1">
              Получение: {{ pickupLabel }}
            </p>
          </div>
        </div>

        <div class="gv-card-elevated pa-4 text-body-2">
          <p>
            Аренда {{ bookingDays }} дн. ×
            {{ new Intl.NumberFormat("ru-RU").format(currentListing.pricePerDay) }} ₽
            × {{ period.units }} шт.
          </p>
          <p v-if="deliveryFee" class="mt-2">
            Доставка: {{ new Intl.NumberFormat("ru-RU").format(deliveryFee) }} ₽
          </p>
          <p class="text-h6 text-primary mt-3 mb-0">
            Итого: {{ new Intl.NumberFormat("ru-RU").format(totalPrice) }} ₽
          </p>
        </div>
      </div>

      <div v-show="step === 3" class="max-w-screen-md">
        <v-text-field v-model="contacts.fullName" placeholder="ФИО полностью" variant="outlined" rounded="lg"
          class="mb-3" hide-details />
        <v-text-field v-model="contacts.phone" placeholder="Телефон" variant="outlined" rounded="lg" class="mb-3"
          hide-details />
        <v-text-field v-model="contacts.email" placeholder="E-mail" variant="outlined" rounded="lg" class="mb-3"
          hide-details />
        <v-text-field :model-value="`Способ получения: ${pickupLabel}`" variant="outlined" rounded="lg" hide-details
          readonly />
      </div>

      <div v-show="step === 4" class="max-w-screen-md">
        <div class="gv-card-elevated pa-4 mb-4">
          <p class="text-body-2 text-medium-emphasis mb-2">{{ selectionSummary }}</p>
          <p class="text-h5 gv-display text-primary mb-0">
            К оплате: {{ new Intl.NumberFormat("ru-RU").format(totalPrice) }} ₽
          </p>
        </div>

        <v-checkbox v-model="contacts.agreeContract" density="comfortable" hide-details class="mb-2">
          <template #label>
            <span class="text-body-2">
              Согласен с договором аренды (PDF формируется автоматически)
            </span>
          </template>
        </v-checkbox>
        <v-checkbox v-model="contacts.agreePersonal" density="comfortable" hide-details>
          <template #label>
            <span class="text-body-2">Согласен на обработку персональных данных</span>
          </template>
        </v-checkbox>
        <p class="text-caption mt-3 text-medium-emphasis">
          После оплаты сформируются PDF: договор аренды и акт приёма-передачи.
        </p>
      </div>

      <div class="d-flex flex-wrap ga-3 mt-6">
        <v-btn v-if="step > 1" variant="outlined" color="primary" class="gv-cta" rounded="lg" @click="prevStep">
          Назад
        </v-btn>
        <v-btn v-if="step < 4" color="primary" class="gv-cta" rounded="lg" @click="nextStep">
          Далее
        </v-btn>
        <v-btn v-if="step === 4" color="primary" class="gv-cta" rounded="lg" :loading="isSubmitting" :disabled="!canPay"
          @click="pay">
          Оплатить
        </v-btn>
      </div>

      <p v-if="stepError" class="text-error mt-4">{{ stepError }}</p>
    </template>

    <p v-else-if="!isLoading" class="text-medium-emphasis">
      Объявление не найдено.
      <NuxtLink to="/listings">Вернуться в каталог</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.step-pill {
  cursor: pointer;
  background: #fafafa;
  border-color: #e8e8e8 !important;
  color: rgba(0, 0, 0, 0.45);
}

.step-pill--active {
  border-color: var(--gv-primary) !important;
  color: var(--gv-primary);
  font-weight: 600;
  background: var(--gv-primary-soft-bg);
}

.booking-wizard__total {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
}

.booking-wizard__thumb {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
  background: #e8e8e8;
  overflow: hidden;
}

.booking-wizard__thumb--empty {
  min-width: 120px;
}

.booking-wizard__date-chip {
  border-radius: 999px !important;
}
</style>
