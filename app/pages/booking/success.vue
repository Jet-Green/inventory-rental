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

useSeoMeta({ title: "Бронь оформлена — gorodaivesi.ru" });
</script>

<template>
  <div v-if="lastBooking" class="success-page pb-12 pt-4">
    <div class="gv-page-wide px-4 px-sm-6">
      <div class="gv-card-elevated pa-8 mx-auto success-page__card">
        <h1 class="gv-display text-h5 mb-3">Бронь успешно оформлена</h1>
        <p class="font-weight-semibold mb-4" style="color: rgba(0,0,0,0.75)">
          Номер брони: {{ displayId }}
        </p>
        <div class="text-body-2 text-medium-emphasis d-flex flex-column ga-2 mb-5">
          <p>Оборудование: см. договор в PDF</p>
          <p>Сумма и даты уточняются в кабинете</p>
        </div>

        <div class="success-page__docs rounded-lg pa-4 mb-5">
          <p class="font-weight-semibold mb-2">Документы</p>
          <a
            v-if="lastBooking.rentalAgreementPdfUrl"
            :href="lastBooking.rentalAgreementPdfUrl"
            target="_blank"
            class="gv-link d-block mb-1"
          >
            Договор аренды.pdf
          </a>
          <a
            v-if="lastBooking.agencyAgreementPdfUrl"
            :href="lastBooking.agencyAgreementPdfUrl"
            target="_blank"
            class="gv-link d-block"
          >
            Агентский договор.pdf
          </a>
        </div>

        <p class="text-caption text-medium-emphasis mb-6">
          Уведомления в Telegram: подключите бота, чтобы не пропустить статусы брони.
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
  border: 1px solid #e8e8e8;
}
</style>
