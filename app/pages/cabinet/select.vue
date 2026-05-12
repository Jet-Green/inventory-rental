<script setup lang="ts">
/**
 * Старый URL: редирект с открытием попапа выбора кабинета (см. app.vue + query openCabinetSelect).
 */
definePageMeta({
  middleware: "auth",
});

const route = useRoute();

await navigateTo({
  path: "/renter-cabinet/rentals",
  query: { ...route.query, openCabinetSelect: "1" },
  replace: true,
});
</script>

<template>
  <div class="gv-page-wide px-4 py-12 text-medium-emphasis text-body-2">
    Перенаправление…
  </div>
</template>
