<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});
</script>

<template>
  <BusinessBookingsCalendar />
</template>
