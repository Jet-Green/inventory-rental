<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-3">Обзор</h1>
    <p class="text-body-2 text-medium-emphasis">
      Краткая сводка по объявлениям и броням (макет).
    </p>
  </div>
</template>
