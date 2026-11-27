<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="account-panel" aria-labelledby="account-title">
    <h1 id="account-title" class="account-panel__title">{{ title }}</h1>
    <div class="account-panel__body"><slot /></div>
  </section>
</template>

<style scoped>
.account-panel {
  width: min(480px, calc(100% - 32px));
  margin: clamp(24px, 6vw, 80px) auto;
  padding: clamp(22px, 4vw, 38px);
  color: var(--gv-text);
  background: var(--gv-card-bg);
  border: 1px solid var(--gv-border-light);
  border-radius: 16px;
  overflow-wrap: anywhere;
}
.account-panel__title { margin: 0 0 20px; font: 750 clamp(24px, 3vw, 32px)/1.15 var(--gv-font-display); }
.account-panel__body { display: grid; gap: 14px; min-width: 0; }
.account-panel__body :deep(p) { line-height: 1.55; }
.account-panel__body :deep(a:not(.v-btn)) { color: #146a81; text-underline-offset: 3px; }
.account-panel__body :deep([role="alert"]) { padding: 12px 14px; background: #fff3ef; border-radius: 8px; }
.account-panel__body :deep(.v-btn) { letter-spacing: normal; text-transform: none; }
</style>
