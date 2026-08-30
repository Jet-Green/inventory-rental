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

const line1 = computed(() => Math.round(props.size * 0.46));
const line2 = computed(() => Math.round(props.size * 0.62));
</script>

<template>
  <span class="app-logo" :style="{ gap: `${Math.round(size * 0.3)}px` }">
    <!--
      Знак в духе указателей «Города и Веси»: голубая табличка-указатель
      с белой каймой и белой стрелкой-направлением.
    -->
    <svg
      class="app-logo__mark"
      :width="size"
      :height="size"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <!-- Табличка-указатель со «срезом» справа, как дорожный знак-стрелка. -->
      <path
        d="M4 8 h24 l8 12 -8 12 H4 a2 2 0 0 1 -2 -2 V10 a2 2 0 0 1 2 -2 Z"
        fill="#23afd6"
      />
      <path
        d="M4 8 h24 l8 12 -8 12 H4 a2 2 0 0 1 -2 -2 V10 a2 2 0 0 1 2 -2 Z"
        fill="none"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <!-- Белая стрелка «вперёд/в путь». -->
      <path
        d="M11 20 h11 M18 15 l6 5 -6 5"
        stroke="#ffffff"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span v-if="wordmark" class="app-logo__text">
      <span class="app-logo__line1 gv-display" :style="{ fontSize: `${line1}px` }">Аренда</span>
      <span class="app-logo__line2 gv-hand" :style="{ fontSize: `${line2}px` }">инвентаря</span>
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
  line-height: 0.92;
}

.app-logo__line1 {
  color: var(--gv-text);
  font-weight: 800;
  letter-spacing: -0.01em;
}

.app-logo__line2 {
  color: var(--gv-primary);
  line-height: 0.8;
  margin-top: 1px;
}
</style>
