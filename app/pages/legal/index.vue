<script setup lang="ts">
import { LEGAL_DOCS } from "~/constants/legalDocs";

useSeoMeta({
  title: "Документы и правовая информация — Аренда инвентаря",
  description: "Пользовательское соглашение, оферта, договор аренды и политика конфиденциальности.",
});
</script>

<template>
  <div class="gv-page-wide px-4 px-sm-6 py-8 legal-index">
    <span class="gv-sign-eyebrow mb-3">Документы</span>
    <h1 class="gv-display legal-index__title mb-2">Правовая информация</h1>
    <p class="text-muted mb-2 legal-index__lead">
      Площадка «Аренда инвентаря» выступает агентом между арендодателем и
      арендатором. Ниже — документы, регулирующие эти отношения.
    </p>
    <p class="legal-index__note mb-6">
      Документы являются шаблонами и требуют проверки юристом перед публикацией.
    </p>

    <div class="legal-index__grid">
      <NuxtLink
        v-for="doc in LEGAL_DOCS"
        :key="doc.slug"
        :to="`/legal/${doc.slug}`"
        class="legal-card gv-card-elevated pa-5"
      >
        <v-icon class="mb-3" color="secondary">mdi-file-document-outline</v-icon>
        <p class="legal-card__title mb-1">{{ doc.title }}</p>
        <p class="legal-card__summary mb-0">{{ doc.summary }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.legal-index__title {
  font-size: clamp(1.5rem, 1.1rem + 1.4vw, 2.25rem);
}

.legal-index__lead {
  max-width: 640px;
  font-size: 15px;
}

.legal-index__note {
  font-size: 13px;
  color: var(--gv-text-muted);
}

.legal-index__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.legal-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.legal-card:hover {
  border-color: var(--gv-sign);
}

.legal-card__title {
  font-weight: 700;
  font-size: 15px;
  color: var(--gv-text);
}

.legal-card__summary {
  font-size: 13px;
  color: var(--gv-text-secondary);
  line-height: 1.5;
}
</style>
