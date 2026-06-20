<script setup lang="ts">
type DocStatus = "signed" | "on-sign" | "waiting";

const props = defineProps<{
  title: string;
  /** Подзаголовок: «Бронь #… · Дата». */
  subtitle?: string;
  status?: DocStatus;
  /** Ссылка на PDF; при отсутствии — действия задизейблены. */
  pdfUrl?: string;
}>();

const STATUS_META: Record<DocStatus, { label: string; color: string }> = {
  signed: { label: "Подписан", color: "success" },
  "on-sign": { label: "На подписи", color: "warning" },
  waiting: { label: "Ожидает", color: "grey" },
};

const statusMeta = computed(() =>
  props.status ? STATUS_META[props.status] : null,
);

const hasUrl = computed(() => !!props.pdfUrl);
</script>

<template>
  <div class="gv-card-elevated pa-5">
    <p class="font-weight-semibold mb-2 document-card__title">{{ title }}</p>
    <p v-if="subtitle" class="text-caption text-medium-emphasis mb-2">
      {{ subtitle }}
    </p>
    <v-chip
      v-if="statusMeta"
      size="small"
      variant="tonal"
      :color="statusMeta.color"
      class="mb-3 document-card__status"
    >
      {{ statusMeta.label }}
    </v-chip>
    <div class="d-flex ga-2 flex-wrap">
      <v-btn
        :href="hasUrl ? pdfUrl : undefined"
        :tag="hasUrl ? 'a' : 'button'"
        target="_blank"
        rel="noopener"
        variant="outlined"
        color="primary"
        class="gv-cta"
        rounded="lg"
        size="small"
        :disabled="!hasUrl"
        prepend-icon="mdi-file-pdf-box"
      >
        Открыть PDF
      </v-btn>
      <v-btn
        :href="hasUrl ? pdfUrl : undefined"
        :tag="hasUrl ? 'a' : 'button'"
        download
        color="primary"
        class="gv-cta"
        rounded="lg"
        size="small"
        :disabled="!hasUrl"
        prepend-icon="mdi-download"
      >
        Скачать
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
