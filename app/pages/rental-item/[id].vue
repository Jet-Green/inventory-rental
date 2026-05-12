<script setup lang="ts">
import dayjs from "dayjs";
import { useRentalItem } from "~/composables/useRentalItem";
import { useRole } from "~/composables/useRole";
import { listingToDraft, useBookingDraft } from "~/composables/useBookingDraft";

const route = useRoute();
const id = String(route.params.id || "");

const { currentListing, fetchListingById, isLoading } = useRentalItem();
const { isRenter, isAdmin, isAuth } = useRole();
const draft = useBookingDraft();

const selectedPhoto = ref(0);

const form = reactive({
  dateFrom: "",
  dateTo: "",
  units: 1,
});

onMounted(() => {
  void fetchListingById(id);
});

watch(
  () => route.params.id,
  (next) => {
    const nid = String(next || "");
    if (nid) {
      void fetchListingById(nid);
    }
  },
);

watch(
  () => currentListing.value?.photos,
  (photos) => {
    if (!photos?.length) selectedPhoto.value = 0;
    else if (selectedPhoto.value >= photos.length) selectedPhoto.value = 0;
  },
  { immediate: true },
);

const pickupLabel = computed(() => {
  const l = currentListing.value;
  if (!l) return "";
  if (l.pickupType === "pickup") return "самовывоз";
  if (l.pickupType === "delivery") return "доставка";
  return "самовывоз или доставка";
});

const categoriesLine = computed(() => {
  const l = currentListing.value;
  if (!l?.categories?.length) return "";
  return `${l.categories.map((c) => c.name).join(" · ")} · ID ${l._id.slice(-5)}`;
});

const bookingDays = computed(() => {
  if (!form.dateFrom || !form.dateTo) return 0;
  const a = dayjs(form.dateFrom);
  const b = dayjs(form.dateTo);
  const d = b.diff(a, "day");
  return d > 0 ? d : 0;
});

const totalPrice = computed(() => {
  const l = currentListing.value;
  if (!l || !bookingDays.value) return 0;
  return bookingDays.value * l.pricePerDay * form.units;
});

const selectionSummary = computed(() => {
  if (!form.dateFrom || !form.dateTo || !bookingDays.value) {
    return "Выберите даты в календаре ниже или полями бронирования";
  }
  const a = dayjs(form.dateFrom).format("DD.MM");
  const b = dayjs(form.dateTo).format("DD.MM");
  return `Выбрано: ${a} — ${b} · ${bookingDays.value} дн.`;
});

const canContinue = computed(
  () =>
    !!form.dateFrom &&
    !!form.dateTo &&
    bookingDays.value > 0 &&
    form.units >= 1 &&
    !!currentListing.value,
);

const bookingHint = computed(() => {
  if (!isAuth.value) return "Для бронирования войдите в аккаунт.";
  if (!isRenter.value && !isAdmin.value) {
    return "Бронирование доступно для подтверждённого пользователя.";
  }
  if (!canContinue.value) return "Укажите корректный период аренды.";
  return "";
});

function continueCheckout(): void {
  if (!currentListing.value || !canContinue.value) return;
  if (!isAuth.value) {
    navigateTo("/auth");
    return;
  }
  if (!isRenter.value && !isAdmin.value) return;
  draft.value = listingToDraft(currentListing.value, { ...form }, pickupLabel.value);
  navigateTo("/booking/checkout");
}

useSeoMeta({
  title: currentListing.value?.title
    ? `${currentListing.value.title} — gorodaivesi.ru`
    : "Объявление",
  description: currentListing.value?.description || "Аренда оборудования",
});
</script>

<template>
  <div class="listing-page pb-12 pt-6">
    <v-progress-linear v-if="isLoading" indeterminate color="primary" />
    <div v-if="currentListing" class="gv-page-wide px-4 px-sm-6">
      <v-row class="ga-6">
        <v-col cols="12" lg="8">
          <div class="mb-5">
            <div
              class="listing-page__hero rounded-lg"
              :class="{ 'listing-page__hero--empty': !currentListing.photos?.[selectedPhoto] }"
            >
              <v-img
                v-if="currentListing.photos?.[selectedPhoto]"
                :src="currentListing.photos[selectedPhoto]"
                cover
                height="420"
                rounded="lg"
              />
            </div>
            <div v-if="(currentListing.photos?.length || 0) > 1" class="d-flex ga-2 mt-3 flex-wrap">
              <button
                v-for="(ph, idx) in currentListing.photos"
                :key="idx"
                type="button"
                class="listing-page__thumb"
                :class="{ 'listing-page__thumb--active': selectedPhoto === idx }"
                @click="selectedPhoto = idx"
              >
                <v-img :src="ph" cover height="72" width="96" rounded="lg" />
              </button>
            </div>
          </div>

          <div class="gv-card-elevated pa-5 mb-6">
            <h1 class="gv-display text-h5 mb-2">{{ currentListing.title }}</h1>
            <p class="text-body-2 mb-3" style="color: rgba(0,0,0,0.5)">
              {{ categoriesLine }}
            </p>
            <p class="text-body-1 mb-4" style="color: rgba(0,0,0,0.75)">
              {{ currentListing.description }}
            </p>
            <div class="d-flex flex-column ga-2">
              <span class="text-primary font-weight-semibold">
                Цена: {{ new Intl.NumberFormat("ru-RU").format(currentListing.pricePerDay) }} ₽ /
                день
              </span>
              <span class="text-body-2" style="color: rgba(0,0,0,0.65)">
                Мин. срок: {{ currentListing.minDays }} дн.
              </span>
              <span class="text-body-2" style="color: var(--gv-available)">
                Доступно: {{ currentListing.unitsAvailable }} ед.
              </span>
              <span class="text-body-2" style="color: rgba(0,0,0,0.6)">
                Получение: {{ pickupLabel }}
              </span>
            </div>
          </div>

          <RentalCalendar :ranges="currentListing.calendar" />
        </v-col>

        <v-col cols="12" lg="4">
          <div class="gv-card-elevated pa-6 booking-panel">
            <h2 class="text-h6 font-weight-semibold mb-1">Бронирование</h2>
            <p class="text-caption mb-4" style="color: rgba(0,0,0,0.55)">
              Календарь доступности
            </p>

            <div class="booking-panel__calendar rounded-lg pa-3 mb-4 border">
              <p class="text-caption font-weight-semibold mb-2">
                {{ dayjs().format("MMMM YYYY") }}
              </p>
              <p class="text-caption text-medium-emphasis mb-2">
                Пн &nbsp; Вт &nbsp; Ср &nbsp; Чт &nbsp; Пт &nbsp; Сб &nbsp; Вс
              </p>
              <p class="text-caption text-medium-emphasis">
                Уточняйте занятость по сетке ниже и выберите даты.
              </p>
            </div>

            <p class="text-caption mb-4" style="color: rgba(0,0,0,0.65)">
              {{ selectionSummary }}
            </p>

            <div class="d-flex align-center ga-3 mb-4 flex-wrap">
              <span class="text-caption" style="color: rgba(0,0,0,0.6)">Количество</span>
              <v-text-field
                v-model.number="form.units"
                type="number"
                min="1"
                :max="currentListing.unitsAvailable"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 120px"
                rounded="lg"
              />
            </div>

            <v-text-field
              v-model="form.dateFrom"
              label="Дата начала"
              type="date"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              rounded="lg"
              hide-details
            />
            <v-text-field
              v-model="form.dateTo"
              label="Дата окончания"
              type="date"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              rounded="lg"
              hide-details
            />

            <div class="booking-panel__total rounded-lg pa-4 mb-4">
              <p class="text-caption mb-1" style="color: rgba(0,0,0,0.5)">Итого к оплате</p>
              <p class="text-h4 gv-display text-primary">
                {{ new Intl.NumberFormat("ru-RU").format(totalPrice) }} ₽
              </p>
            </div>

            <v-btn
              block
              color="primary"
              class="gv-cta"
              rounded="lg"
              size="large"
              :disabled="!canContinue || (!isRenter && !isAdmin && isAuth)"
              @click="continueCheckout"
            >
              Забронировать
            </v-btn>
            <p
              class="text-caption mt-3"
              :class="bookingHint && !canContinue ? 'text-error' : 'text-medium-emphasis'"
            >
              {{ bookingHint || "Далее — контакты и оплата." }}
            </p>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.listing-page__hero {
  background: #e8e8e8;
  min-height: 200px;
}

.listing-page__hero--empty {
  min-height: 420px;
}

.listing-page__thumb {
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f2f2f2;
}

.listing-page__thumb--active {
  border: 2px solid var(--gv-primary);
}

.booking-panel {
  position: sticky;
  top: 16px;
}

.booking-panel__calendar {
  border-color: var(--gv-border) !important;
}

.booking-panel__total {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
}
</style>
