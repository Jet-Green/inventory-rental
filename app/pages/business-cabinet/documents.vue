<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import dayjs from "dayjs";
import { useOwnerBookings } from "~/composables/useOwnerBookings";

const { bookings, fetchOwnerBookings, isLoading } = useOwnerBookings();

const search = ref("");
const typeFilter = ref<"all" | "rental" | "agency">("all");

const FILTERS: Array<{ value: "all" | "rental" | "agency"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "rental", label: "Договор" },
  { value: "agency", label: "Агентский" },
];

const loadError = ref(false);
async function load(): Promise<void> {
  loadError.value = false;
  try {
    await fetchOwnerBookings();
  } catch {
    loadError.value = true;
  }
}
onMounted(() => {
  void load();
});

interface IDocItem {
  id: string;
  title: string;
  subtitle: string;
  status: "signed" | "on-sign" | "waiting";
  pdfUrl?: string;
  kind: "rental" | "agency";
}

const documents = computed<IDocItem[]>(() => {
  const out: IDocItem[] = [];
  for (const b of bookings.value) {
    const ref = `Бронь #${b._id.slice(-8)} · ${dayjs(b.dateFrom).format("DD.MM.YYYY")}`;
    out.push({
      id: `${b._id}-rental`,
      title: "Договор аренды",
      subtitle: ref,
      status: b.rentalAgreementPdfUrl ? "signed" : "waiting",
      pdfUrl: b.rentalAgreementPdfUrl || undefined,
      kind: "rental",
    });
    out.push({
      id: `${b._id}-agency`,
      title: "Агентский договор",
      subtitle: ref,
      status: b.agencyAgreementPdfUrl ? "signed" : "on-sign",
      pdfUrl: b.agencyAgreementPdfUrl || undefined,
      kind: "agency",
    });
  }
  return out;
});

const filteredDocuments = computed(() => {
  return documents.value.filter(
    (d) =>
      (typeFilter.value === "all" || d.kind === typeFilter.value) &&
      `${d.title} ${d.subtitle}`
        .toLocaleLowerCase()
        .includes((search.value || "").trim().toLocaleLowerCase()),
  );
});
</script>

<template>
  <div class="business-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-4">Документы</h1>

    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
      title="Не удалось загрузить данные"
    >
      <v-btn variant="text" :disabled="isLoading" @click="load"
        >Повторить</v-btn
      >
    </v-alert>
    <div class="business-toolbar">
      <v-text-field
        v-model="search"
        label="Найти документ по брони"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        @click:clear="search = ''"
      />
      <v-chip-group v-model="typeFilter" mandatory class="mb-4">
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
    </div>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div v-if="filteredDocuments.length" class="business-panel documents-list">
      <article
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="document-row"
      >
        <v-icon icon="mdi-file-document-outline" size="28" color="primary" />
        <div>
          <p class="font-weight-semibold mb-1">{{ doc.title }}</p>
          <p class="business-muted mb-0">{{ doc.subtitle }}</p>
        </div>
        <v-chip
          size="small"
          variant="tonal"
          :color="doc.pdfUrl ? 'success' : undefined"
          >{{ doc.pdfUrl ? "PDF готов" : "PDF не сформирован" }}</v-chip
        >
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            :href="doc.pdfUrl"
            :disabled="!doc.pdfUrl"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="primary"
            class="gv-cta"
            size="small"
            >Открыть PDF</v-btn
          >
          <v-btn
            :href="doc.pdfUrl"
            :disabled="!doc.pdfUrl"
            download
            variant="text"
            color="primary"
            size="small"
            aria-label="Скачать PDF"
            icon="mdi-download"
          />
        </div>
      </article>
    </div>

    <EmptyState
      v-else-if="!isLoading && !loadError"
      :title="documents.length ? 'Документы не найдены' : 'Документов пока нет'"
      :description="
        documents.length
          ? 'Измените поиск или тип документа.'
          : 'Документы по броням ваших объявлений появятся здесь.'
      "
    />
  </div>
</template>
<style scoped>
.document-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 20px;
  padding-block: 20px;
}
.document-row + .document-row {
  border-top: 1px solid var(--gv-border-light);
}
@media (max-width: 1000px) {
  .document-row {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
  }
  .document-row > :nth-child(n + 3) {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
