<script setup lang="ts">
import { useRentalItem } from "~/composables/useRentalItem";
import { useRole } from "~/composables/useRole";

const route = useRoute();
const id = String(route.params.id || "");

const { currentListing, fetchListingById, isLoading } = useRentalItem();
const { isRenter, isAdmin, isAuth } = useRole();

const selectedPhoto = ref(0);

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
  return l.categories
    .map((c) => (typeof c === "string" ? c : c?.name))
    .filter(Boolean)
    .join(" · ");
});

const bookingHint = computed(() => {
  if (!isAuth.value) return "Для бронирования войдите в аккаунт.";
  if (!isRenter.value && !isAdmin.value) {
    return "Бронирование доступно для подтверждённого пользователя.";
  }
  return "";
});

function startBooking(): void {
  if (!currentListing.value) return;
  if (!isAuth.value) {
    navigateTo("/auth");
    return;
  }
  if (!isRenter.value && !isAdmin.value) return;
  navigateTo(`/booking/${currentListing.value._id}`);
}

useSeoMeta({
  title: currentListing.value?.title
    ? `${currentListing.value.title} — Аренда инвентаря`
    : "Объявление",
  description: currentListing.value?.description || "Аренда инвентаря",
});
</script>

<template>
  <div class="listing-page pb-12 pt-6">
    <v-progress-linear v-if="isLoading" indeterminate color="primary" />
    <div v-if="currentListing" class="gv-page-wide px-4 px-sm-6">
      <v-row class="align-start">
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
        </v-col>

        <v-col cols="12" lg="4">
          <div class="gv-card-elevated pa-6 listing-page__cta">
            <h2 class="text-h6 font-weight-semibold mb-2">Бронирование</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Оформление в несколько шагов: период, проверка, контакты и оплата.
            </p>
            <p class="text-primary font-weight-semibold text-h6 mb-4">
              от
              {{ new Intl.NumberFormat("ru-RU").format(currentListing.pricePerDay) }} ₽ / день
            </p>
            <v-btn
              block
              color="primary"
              class="gv-cta"
              rounded="lg"
              size="large"
              :disabled="!!bookingHint && isAuth"
              @click="startBooking"
            >
              Забронировать
            </v-btn>
            <p
              v-if="bookingHint"
              class="text-caption mt-3"
              :class="bookingHint ? 'text-error' : 'text-medium-emphasis'"
            >
              {{ bookingHint }}
            </p>
          </div>
        </v-col>

        <v-col cols="12">
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
                Цена:
                {{ new Intl.NumberFormat("ru-RU").format(currentListing.pricePerDay) }} ₽ / день
              </span>
              <span class="text-body-2" style="color: rgba(0,0,0,0.65)">
                Мин. срок: {{ currentListing.minDays }} дн.
              </span>
              <span class="text-body-2 font-weight-medium" style="color: var(--gv-available-text)">
                Доступно: {{ currentListing.unitsAvailable }} ед.
              </span>
              <span class="text-body-2" style="color: rgba(0,0,0,0.6)">
                Получение: {{ pickupLabel }}
              </span>
            </div>
          </div>

          <RentalCalendar :ranges="currentListing.calendar" />
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

.listing-page__cta {
  position: sticky;
  top: 16px;
}
</style>
