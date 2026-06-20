<script setup lang="ts">
import dayjs from "dayjs";
import { useBooking } from "~/composables/useBooking";

definePageMeta({ middleware: "auth" });

const { lastBooking } = useBooking();

onMounted(() => {
  if (!lastBooking.value) {
    navigateTo("/renter-cabinet/rentals");
  }
});

const displayId = computed(
  () => lastBooking.value?.bookingId || `BRN-${dayjs().format("YYYY")}-009184`,
);

const totalLabel = computed(() => {
  const total = lastBooking.value?.totalPrice;
  if (!total && total !== 0) return null;
  return `${new Intl.NumberFormat("ru-RU").format(total)} ₽`;
});

useSeoMeta({ title: "Бронь оформлена — Аренда инвентаря" });
</script>

<template>
  <div v-if="lastBooking" class="success-page pb-12 pt-4">
    <div class="gv-page-wide px-4 px-sm-6">
      <div class="gv-card-elevated pa-8 mx-auto success-page__card">
        <v-icon icon="mdi-check-circle" size="48" color="success" class="mb-3" />
        <h1 class="gv-display text-h5 mb-3">Бронь успешно оформлена</h1>
        <p class="font-weight-semibold mb-4" style="color: rgba(0,0,0,0.75)">
          Номер брони: {{ displayId }}
        </p>
        <div class="text-body-2 text-medium-emphasis d-flex flex-column ga-2 mb-5">
          <p class="mb-0">
            Статус:
            <StatusChip :status="lastBooking.status" type="booking" />
          </p>
          <p v-if="lastBooking.days" class="mb-0">Срок: {{ lastBooking.days }} дн.</p>
          <p v-if="totalLabel" class="mb-0">Сумма: {{ totalLabel }}</p>
        </div>

        <div class="success-page__docs rounded-lg pa-4 mb-5">
          <p class="font-weight-semibold mb-2">Документы</p>
          <a
            v-if="lastBooking.rentalAgreementPdfUrl"
            :href="lastBooking.rentalAgreementPdfUrl"
            target="_blank"
            rel="noopener"
            class="gv-link d-flex align-center ga-1 mb-1"
          >
            <v-icon icon="mdi-file-pdf-box" size="16" />
            Договор аренды.pdf
          </a>
          <a
            v-if="lastBooking.agencyAgreementPdfUrl"
            :href="lastBooking.agencyAgreementPdfUrl"
            target="_blank"
            rel="noopener"
            class="gv-link d-flex align-center ga-1"
          >
            <v-icon icon="mdi-file-pdf-box" size="16" />
            Агентский договор.pdf
          </a>
        </div>

        <p class="text-caption text-medium-emphasis d-flex align-center ga-1 mb-6">
          <v-icon icon="mdi-send" size="16" />
          Подключите Telegram-бота, чтобы получать статусы брони.
        </p>

        <v-btn
          block
          color="primary"
          class="gv-cta"
          rounded="lg"
          to="/renter-cabinet/rentals"
        >
          Перейти в кабинет
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page__card {
  max-width: 720px;
}

.success-page__docs {
  background: #f5f8f0;
  border: 1px solid #d4e09a;
}
</style>
