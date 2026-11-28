<script setup lang="ts">
const props = defineProps<{
  title: string;
  /** Подзаголовок: «Бронь #… · Дата получения». */
  subtitle?: string;
  pdfUrl?: string;
}>();

// URL документа не свидетельствует о подписании договора.
const hasUrl = computed(() => !!props.pdfUrl?.trim());
const documentName = computed(() => [props.title, props.subtitle].filter(Boolean).join(" · "));
</script>

<template>
  <div class="gv-card-elevated pa-5">
    <p class="font-weight-semibold mb-2 document-card__title">{{ title }}</p>
    <p v-if="subtitle" class="text-caption text-medium-emphasis mb-2">
      {{ subtitle }}
    </p>
    <v-chip
      size="small"
      variant="tonal"
      :color="hasUrl ? 'success' : undefined"
      class="mb-3 document-card__status"
    >
      {{ hasUrl ? 'PDF доступен' : 'PDF пока недоступен' }}
    </v-chip>
    <p v-if="!hasUrl" class="text-caption text-medium-emphasis mb-3 document-card__notice">
      Ссылка на документ пока отсутствует. Обновите список позже.
    </p>
    <div class="d-flex ga-2 flex-wrap">
      <v-btn
        :href="hasUrl ? pdfUrl : undefined"
        :tag="hasUrl ? 'a' : 'button'"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Открыть PDF: ${documentName} (в новой вкладке)`"
        variant="outlined"
        color="primary"
        class="gv-cta"
        size="small"
        :disabled="!hasUrl"
        prepend-icon="mdi-file-pdf-box"
      >
        Открыть PDF ↗
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.document-card__title {
  font-size: 14px;
}

.document-card__status {
  font-size: 11px;
  font-weight: 500;
  text-transform: none;
}
</style>
