<script setup lang="ts">
import { useBookingDraft } from "~/composables/useBookingDraft";

definePageMeta({ middleware: "auth" });

const draft = useBookingDraft();

onMounted(async () => {
  if (draft.value?.listingId) {
    await navigateTo(`/booking/${draft.value.listingId}?step=3`, { replace: true });
    return;
  }
  await navigateTo("/listings", { replace: true });
});
</script>

<template>
  <div class="gv-page-wide px-4 py-12 text-center text-medium-emphasis">
    Перенаправление…
  </div>
</template>
