<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "cabinet-home"],
});
</script>

<template>
  <div class="cabinet-root-fallback" aria-hidden="true" />
</template>

<style scoped>
.cabinet-root-fallback {
  min-height: 40vh;
}
</style>
