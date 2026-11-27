<script setup lang="ts">
import { useBooking } from "~/composables/useBooking";

definePageMeta({ middleware: "auth" });

const { lastBooking } = useBooking();

onMounted(() => {
  if (!lastBooking.value) {
    navigateTo("/renter-cabinet/rentals");
  }
});

const displayId = computed(
  () => lastBooking.value?.bookingId || "—",
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
        <v-icon icon="mdi-check-circle" size="64" color="success" class="mb-3" />
        <h1 class="gv-display text-h5 mb-3">Всё готово к вашей аренде</h1><p class="text-body-2 text-medium-emphasis mb-6">Бронь оформлена. Её статус и документы всегда доступны в кабинете.</p>
        <p class="success-page__number font-weight-semibold mb-4" style="color: var(--gv-text-secondary)">
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

        <div class="success-page__docs pa-4 mb-5">
          <p class="font-weight-semibold mb-2">Документы по бронированию</p><p v-if="!lastBooking.rentalAgreementPdfUrl && !lastBooking.agencyAgreementPdfUrl" class="text-body-2 text-medium-emphasis mb-0">Документы пока не сформированы. Проверьте их позже в кабинете.</p>
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
          to="/renter-cabinet/rentals"
        >
          Перейти в кабинет
        </v-btn><NuxtLink to="/listings" class="success-page__catalog">Выбрать ещё инвентарь <v-icon icon="mdi-arrow-right" size="18" /></NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page__card {
  max-width: 640px;
  margin-top: 40px;
  border-top: 4px solid var(--gv-available-text);
}

.success-page__docs {
  background: var(--gv-available-soft-bg);
  border: 1px solid var(--gv-available-soft-border);
  border-radius: var(--gv-radius-card);
}
.success-page__number { overflow-wrap:anywhere; border-bottom:1px solid var(--gv-border-light); padding-bottom:20px; }
.success-page__catalog { display:flex; justify-content:center; align-items:center; gap:10px; margin-top:20px; text-decoration:none; color:var(--gv-text-secondary); font-size:14px; }
@media(max-width:599px) { .success-page__card { padding:22px !important; margin-top:12px; } }
</style>
