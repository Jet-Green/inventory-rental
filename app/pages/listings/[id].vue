<script setup lang="ts">
const route = useRoute();
const id = String(route.params.id || "");
await navigateTo({ path: `/rental-item/${id}`, query: route.query }, { replace: true });
</script>

<template>
  <div />
</template>
