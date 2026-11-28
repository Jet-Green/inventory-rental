<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const listingId = computed(() => String(route.params.listingId || ""));

useSeoMeta({ title: "Бронирование — Аренда инвентаря" });
</script>

<template>
  <BookingWizard v-if="listingId" :listing-id="listingId" />
</template>
