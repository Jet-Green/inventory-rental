<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Размер иконки-знака в px. Текст масштабируется относительно него. */
    size?: number;
    /** Показывать словесный знак рядом с иконкой. */
    wordmark?: boolean;
  }>(),
  {
    size: 34,
    wordmark: true,
  },
);

const line1 = computed(() => Math.round(props.size * 0.5));
const line2 = computed(() => Math.round(props.size * 0.48));
</script>

<template>
  <span class="app-logo" :style="{ gap: `${Math.round(size * 0.32)}px` }">
    <svg
      class="app-logo__mark"
      :width="size"
      :height="size"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#app-logo-grad)" />
      <g
        stroke="#ffffff"
        stroke-width="2.2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <path d="M20 8 L29.5 13.5 L20 19 L10.5 13.5 Z" />
        <path d="M10.5 13.5 V24.5 L20 30 V19" />
        <path d="M29.5 13.5 V24.5 L20 30" />
      </g>
      <defs>
        <linearGradient id="app-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ff8a33" />
          <stop offset="1" stop-color="#ff6600" />
        </linearGradient>
      </defs>
    </svg>

    <span v-if="wordmark" class="app-logo__text gv-display">
      <span class="app-logo__line1" :style="{ fontSize: `${line1}px` }">Аренда</span>
      <span class="app-logo__line2" :style="{ fontSize: `${line2}px` }">инвентаря</span>
    </span>
  </span>
</template>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
}

.app-logo__mark {
  flex-shrink: 0;
  display: block;
}

.app-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.app-logo__line1 {
  color: var(--gv-text);
  font-weight: 900;
  letter-spacing: -0.01em;
}

.app-logo__line2 {
  color: var(--gv-primary);
  font-weight: 800;
  letter-spacing: -0.01em;
}
</style>
