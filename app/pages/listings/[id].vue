<script setup lang="ts">
const route = useRoute();
const id = String(route.params.id || "");
await navigateTo(`/rental-item/${id}`, { replace: true });
</script>

<template>
  <div />
</template>
