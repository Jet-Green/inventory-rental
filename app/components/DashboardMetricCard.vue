<script setup lang="ts">
defineProps<{
  /** Подпись метрики (напр. «Брони за сутки»). */
  label: string;
  value: string | number;
  /** Иконка mdi (напр. `mdi-calendar-check`). */
  icon?: string;
  /** Динамика, выводится акцентным цветом ссылки (--gv-link). */
  delta?: string;
}>();
</script>

<template>
  <div class="gv-card-elevated stat-card pa-5">
    <div class="d-flex align-start justify-space-between ga-2">
      <div>
        <p class="stat-card__value gv-display mb-1">{{ value }}</p>
        <p class="stat-card__label mb-0">{{ label }}</p>
      </div>
      <v-icon v-if="icon" :icon="icon" size="20" color="primary" />
    </div>
    <p v-if="delta" class="stat-card__delta mt-2 mb-0">{{ delta }}</p>
  </div>
</template>

<style scoped>
.stat-card {
  height: 100%;
  border-top: 3px solid var(--gv-primary-soft-border);
}
.stat-card__value {
  font-size: clamp(26px, 2.7vw, 34px);
  overflow-wrap: anywhere;
  line-height: 1.2;
  color: var(--gv-text);
}

.stat-card__label {
  font-size: 14px;
  color: var(--gv-text-secondary);
}

.stat-card__delta {
  font-size: 12px;
  color: var(--gv-link);
}
</style>
