<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import dayjs from "dayjs";
import { useMyBookings } from "~/composables/useMyBookings";

const { bookings, fetchMyBookings, isLoading } = useMyBookings();

const typeFilter = ref<"all" | "rental" | "agency">("all");

const FILTERS: Array<{ value: "all" | "rental" | "agency"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "rental", label: "Договор аренды" },
  { value: "agency", label: "Агентский договор" },
];

const loadError = ref(false);
async function loadBookings() {
  if (isLoading.value) return;
  loadError.value = false;
  try { await fetchMyBookings(); }
  catch { loadError.value = true; }
}
onMounted(() => { void loadBookings(); });

interface IDocItem {
  id: string;
  title: string;
  subtitle: string;
  pdfUrl?: string;
  kind: "rental" | "agency";
}

/** Разворачивает брони в список документов (договор аренды + агентский). */
const documents = computed<IDocItem[]>(() => {
  const out: IDocItem[] = [];
  for (const b of bookings.value) {
    const ref = `Бронь #${b._id.slice(-8)} · Получение ${dayjs(b.dateFrom).format("DD.MM.YYYY")}`;
    out.push({
      id: `${b._id}-rental`,
      title: "Договор аренды",
      subtitle: ref,
      pdfUrl: b.rentalAgreementPdfUrl || undefined,
      kind: "rental",
    });
    out.push({
      id: `${b._id}-agency`,
      title: "Агентский договор",
      subtitle: ref,
      pdfUrl: b.agencyAgreementPdfUrl || undefined,
      kind: "agency",
    });
  }
  return out;
});

const filteredDocuments = computed(() => {
  if (typeFilter.value === "all") return documents.value;
  return documents.value.filter((d) => d.kind === typeFilter.value);
});
</script>

<template>
  <div class="private-page px-4 px-sm-6 py-8">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-4">
      <h1 class="gv-display text-h4">Документы</h1><v-icon icon="mdi-file-document-multiple-outline" size="28" color="primary" />
    </div>

    <p class="text-body-2 text-medium-emphasis mb-4">Здесь доступны PDF договоров. Наличие PDF не подтверждает подписание.</p>
    <v-btn variant="outlined" size="small" prepend-icon="mdi-refresh" :loading="isLoading" class="mb-4" @click="loadBookings">Обновить документы</v-btn>

    <v-chip-group aria-label="Тип договора" v-model="typeFilter" mandatory class="document-filters mb-4">
      <v-chip
        v-for="opt in FILTERS"
        :key="opt.value"
        :value="opt.value"
        size="small"
        :variant="typeFilter === opt.value ? 'flat' : 'outlined'"
        :color="typeFilter === opt.value ? 'primary' : undefined"
      >
        {{ opt.label }}
      </v-chip>
    </v-chip-group>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
      Не удалось загрузить данные.
      <v-btn variant="text" size="small" :loading="isLoading" @click="loadBookings">Повторить</v-btn>
    </v-alert>
    <v-skeleton-loader v-if="isLoading && !bookings.length" type="list-item-two-line, list-item-two-line" class="mb-4" />

    <div v-if="filteredDocuments.length" class="document-list d-flex flex-column ga-3">
      <DocumentCard
        v-for="doc in filteredDocuments"
        :key="doc.id"
        :title="doc.title"
        :subtitle="doc.subtitle"
        :pdf-url="doc.pdfUrl"
      />
    </div>

    <EmptyState
      v-else-if="!isLoading && !loadError"
      title="Документов пока нет"
      description="Документы появятся после оформления первой брони."
    />
  </div>
</template>

<style scoped>
.document-filters :deep(.v-slide-group__content) { flex-wrap: wrap; flex: 1 1 auto; min-width: 0; }
.document-list { max-width: 960px; }
.document-list :deep(.gv-card-elevated) { display: grid; grid-template-columns: 1fr auto; column-gap: 24px; align-items: start; }
.document-list :deep(.document-card__title) { font-size: 16px; }
.document-list :deep(.document-card__status) { grid-column: 2; grid-row: 1; justify-self: end; }
.document-list :deep(.gv-card-elevated > .text-caption) { grid-column: 1; }
.document-list :deep(.document-card__notice) { grid-column: 1 / -1; }
.document-list :deep(.gv-card-elevated > .d-flex) { grid-column: 1 / -1; margin-top: 12px; padding-top: 16px; border-top: 1px solid var(--gv-border-light); }
@media (max-width: 600px) {
 .document-list :deep(.gv-card-elevated) { grid-template-columns: 1fr; }
 .document-list :deep(.document-card__status) { grid-column: 1; grid-row: auto; justify-self: start; margin-top: 8px; }
}
</style>
