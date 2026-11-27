<script setup lang="ts">
import { LEGAL_DOCS } from "~/constants/legalDocs";

useSeoMeta({
  title: "Документы и правовая информация — Аренда инвентаря",
  description: "Пользовательское соглашение, оферта, договор аренды и политика конфиденциальности.",
});
</script>

<template>
  <div class="gv-page-wide px-4 px-sm-6 py-8 legal-index">
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
        class="legal-card"
      >
        <v-icon class="legal-card__icon" aria-hidden="true">mdi-file-document-outline</v-icon>
        <div>
        <p class="legal-card__title mb-1">{{ doc.title }}</p>
        <p class="legal-card__summary mb-0">{{ doc.summary }}</p>
        </div>
        <v-icon size="20" aria-hidden="true">mdi-chevron-right</v-icon>
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

.legal-index { max-width: 860px; margin: 0 auto; }
.legal-index__grid { overflow: hidden; background: white; border: 1px solid var(--gv-border-light); border-radius: 14px; }
.legal-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 18px clamp(12px, 3vw, 24px); color: inherit; text-decoration: none; }
.legal-card + .legal-card { border-top: 1px solid var(--gv-border-light); }
.legal-card:hover, .legal-card:focus-visible { background: #f3fafb; }
.legal-card:focus-visible { outline-offset: -3px; }
.legal-card__icon { color: #18738a; }
.legal-card__title { font-size: 16px; font-weight: 700; }
.legal-card__summary { font-size: 14px; line-height: 1.5; color: var(--gv-text-secondary); }
</style>
