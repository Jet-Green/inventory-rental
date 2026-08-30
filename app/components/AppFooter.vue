<script setup lang="ts">
import { LEGAL_DOCS } from "~/constants/legalDocs";
</script>

<template>
  <footer class="app-footer">
    <div class="gv-page-wide px-4 px-sm-6 app-footer__inner">
      <div class="app-footer__brand">
        <AppLogo :size="30" />
        <p class="app-footer__tagline mt-3">
          Онлайн-аренда инвентаря: спорт, дети, ОВЗ и походы. Площадка-агент
          между арендодателями и арендаторами.
        </p>
      </div>

      <nav class="app-footer__col">
        <p class="app-footer__heading">Каталог</p>
        <NuxtLink to="/" class="app-footer__link">Все объявления</NuxtLink>
        <NuxtLink to="/legal" class="app-footer__link">Документы</NuxtLink>
      </nav>

      <nav class="app-footer__col">
        <p class="app-footer__heading">Правовая информация</p>
        <NuxtLink
          v-for="doc in LEGAL_DOCS"
          :key="doc.slug"
          :to="`/legal/${doc.slug}`"
          class="app-footer__link"
        >
          {{ doc.title }}
        </NuxtLink>
      </nav>
    </div>

    <div class="app-footer__bar">
      <div class="gv-page-wide px-4 px-sm-6 app-footer__bar-inner">
        <span>© {{ new Date().getFullYear() }} Аренда инвентаря</span>
        <span class="app-footer__note">Часть экосистемы «Города и Веси»</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--gv-card-bg);
  border-top: 1px solid var(--gv-border-light);
  margin-top: 48px;
}

.app-footer__inner {
  display: grid;
  gap: 32px;
  grid-template-columns: 1.6fr 1fr 1.2fr;
  padding-top: 40px;
  padding-bottom: 32px;
}

@media (max-width: 720px) {
  .app-footer__inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.app-footer__tagline {
  max-width: 320px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--gv-text-secondary);
}

.app-footer__col {
  display: flex;
  flex-direction: column;
}

.app-footer__heading {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gv-text-muted);
}

.app-footer__link {
  color: var(--gv-text-secondary);
  text-decoration: none;
  font-size: 13px;
  padding: 4px 0;
  transition: color 0.15s ease;
}

.app-footer__link:hover {
  color: var(--gv-primary);
}

.app-footer__bar {
  border-top: 1px solid var(--gv-border-light);
  background: var(--gv-bg-page);
}

.app-footer__bar-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
  font-size: 12px;
  color: var(--gv-text-muted);
}
</style>
