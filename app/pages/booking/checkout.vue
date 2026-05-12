<script setup lang="ts">
import dayjs from "dayjs";
import { useBooking } from "~/composables/useBooking";
import { useAuthProfile } from "~/composables/useAuthProfile";
import { useRole } from "~/composables/useRole";
import { useBookingDraft } from "~/composables/useBookingDraft";

definePageMeta({ middleware: "auth" });

const draft = useBookingDraft();
const { createBooking, isSubmitting } = useBooking();
const { profile, fetchProfile, updateProfile } = useAuthProfile();
const { isRenter, isAdmin } = useRole();

const form = reactive({
  fullName: "",
  phone: "",
  email: "",
  agreeContract: false,
  agreePersonal: false,
});

onMounted(async () => {
  if (!draft.value) {
    await navigateTo("/listings");
    return;
  }
  await fetchProfile();
  if (profile.value) {
    form.fullName = profile.value.fullName || "";
    form.phone = profile.value.phone || "";
    form.email = profile.value.email || "";
  }
});

const rentalDays = computed(() => {
  const d = draft.value;
  if (!d?.dateFrom || !d?.dateTo) return 0;
  const diff = dayjs(d.dateTo).diff(dayjs(d.dateFrom), "day");
  return diff > 0 ? diff : 0;
});

const rentalSubtotal = computed(() => {
  const d = draft.value;
  if (!d || !rentalDays.value) return 0;
  return rentalDays.value * d.pricePerDay * d.units;
});

const deliveryFee = computed(() =>
  draft.value?.pickupLabel.includes("доставк") ? 500 : 0,
);

const total = computed(() => rentalSubtotal.value + deliveryFee.value);

const canPay = computed(
  () =>
    !!draft.value &&
    rentalDays.value > 0 &&
    form.fullName.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.agreeContract &&
    form.agreePersonal &&
    (isRenter.value || isAdmin.value),
);

async function pay(): Promise<void> {
  const d = draft.value;
  if (!d || !canPay.value) return;
  await updateProfile({
    fullName: form.fullName,
    phone: form.phone,
    email: form.email,
  });
  await createBooking({
    listingId: d.listingId,
    dateFrom: d.dateFrom,
    dateTo: d.dateTo,
    units: d.units,
    acceptedPersonalData: form.agreePersonal,
  });
  draft.value = null;
  await navigateTo("/booking/success");
}

useSeoMeta({ title: "Оформление бронирования — gorodaivesi.ru" });
</script>

<template>
  <div v-if="draft" class="checkout gv-page-wide px-4 px-sm-6 py-6">
    <header class="checkout__head d-flex flex-wrap align-baseline ga-4 mb-6">
      <h1 class="gv-display text-h5">Оформление бронирования</h1>
      <span class="text-caption" style="color: rgba(0,0,0,0.45)">Шаг 2 из 2</span>
    </header>

    <v-row>
      <v-col cols="12" md="7">
        <div class="gv-card-elevated d-flex ga-4 pa-4 mb-5">
          <div
            class="checkout__thumb rounded-lg"
            :class="{ 'checkout__thumb--empty': !draft.photo }"
          >
            <v-img v-if="draft.photo" :src="draft.photo" cover height="90" width="120" />
          </div>
          <div>
            <p class="font-weight-semibold mb-1">{{ draft.title }}</p>
            <p class="text-caption text-medium-emphasis">
              {{ dayjs(draft.dateFrom).format("DD.MM.YYYY") }} —
              {{ dayjs(draft.dateTo).format("DD.MM.YYYY") }} · {{ draft.units }} шт. ·
              {{ draft.pickupLabel }}
            </p>
          </div>
        </div>

        <h2 class="text-subtitle-1 font-weight-semibold mb-3">Ваши контакты</h2>
        <v-text-field
          v-model="form.fullName"
          placeholder="ФИО полностью"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          hide-details
        />
        <v-text-field
          v-model="form.phone"
          placeholder="Телефон"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          hide-details
        />
        <v-text-field
          v-model="form.email"
          placeholder="E-mail"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          hide-details
        />
        <v-text-field
          :model-value="`Способ получения: ${draft.pickupLabel}`"
          variant="outlined"
          rounded="lg"
          class="mb-4"
          hide-details
          readonly
        />

        <v-checkbox
          v-model="form.agreeContract"
          density="comfortable"
          hide-details
          class="mb-2"
        >
          <template #label>
            <span class="text-body-2">
              Согласен с договором аренды (PDF формируется автоматически)
            </span>
          </template>
        </v-checkbox>
        <v-checkbox v-model="form.agreePersonal" density="comfortable" hide-details>
          <template #label>
            <span class="text-body-2">Согласен на обработку персональных данных</span>
          </template>
        </v-checkbox>
        <p class="text-caption mt-3" style="color: var(--gv-link)">
          После оплаты сформируются PDF: договор аренды и акт приёма-передачи.
        </p>
        <p v-if="!isRenter && !isAdmin" class="text-caption text-error mt-2">
          Оформление доступно для подтверждённого пользователя.
        </p>
      </v-col>

      <v-col cols="12" md="5">
        <div class="gv-card-elevated pa-6">
          <h2 class="text-h6 font-weight-semibold mb-4">Итог</h2>
          <p class="text-body-2 text-medium-emphasis mb-2">
            Аренда {{ rentalDays }} дн. ×
            {{ new Intl.NumberFormat("ru-RU").format(draft.pricePerDay) }} ₽
          </p>
          <p v-if="deliveryFee" class="text-body-2 text-medium-emphasis mb-4">
            Доставка {{ new Intl.NumberFormat("ru-RU").format(deliveryFee) }} ₽
          </p>
          <p v-else class="text-body-2 text-medium-emphasis mb-4">Доставка не включена</p>

          <div class="checkout__pay rounded-lg pa-4 mb-4">
            <p class="text-caption mb-1" style="color: rgba(0,0,0,0.5)">К оплате</p>
            <p class="text-h5 gv-display text-primary">
              {{ new Intl.NumberFormat("ru-RU").format(total) }} ₽
            </p>
          </div>

          <v-btn
            block
            color="primary"
            class="gv-cta"
            rounded="lg"
            size="large"
            :loading="isSubmitting"
            :disabled="!canPay"
            @click="pay"
          >
            Оплатить
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.checkout__thumb {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
  background: #e8e8e8;
  overflow: hidden;
}

.checkout__thumb--empty {
  min-width: 120px;
}

.checkout__pay {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
}
</style>
