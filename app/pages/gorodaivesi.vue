<script setup lang="ts">
import { rentalHandoffQuery, rentalReturnPath } from "~/utils/rentalHandoff";
definePageMeta({ path: "/auth/gorodaivesi" });
const route = useRoute();
const error = ref("");
const loading = ref(false);
const listingId = typeof route.query.listingId === "string" && /^[a-f0-9]{24}$/.test(route.query.listingId) ? route.query.listingId : "";
const returnPath = rentalReturnPath(`/rental-item/${listingId}?${new URLSearchParams(rentalHandoffQuery(route.query))}`);
async function proceed() {
  if (loading.value || !listingId) return;
  loading.value = true; error.value = '';
  try {
    const result = await useNuxtApp().$apiFetch<{ url: string }>("/auth/federation/start", { method: "POST", retry: 0, body: { returnPath } });
    const target = new URL(result.url);
    if (target.origin !== 'https://gorodaivesi.ru' || target.pathname !== '/federation/authorize') throw new Error('Invalid destination');
    window.location.replace(target.href);
  } catch { error.value = "Не удалось начать вход. Попробуйте ещё раз."; loading.value = false; }
}
onMounted(async () => {
  if (!listingId) { error.value = "Объект не найден. Вернитесь в каталог."; return; }
  // The hint only selects the UI; the provider verifies its own session.
  if (route.query.continue === 'gorodaivesi') await proceed();
});
</script>
<template>
  <section class="page-container py-8 handoff-page">
    <h1 class="section-title">Продолжить бронирование</h1>
    <p v-if="loading" role="status">Переходим к вашему аккаунту…</p>
    <p v-if="error" role="alert" class="text-error">{{ error }}</p>
    <template v-if="listingId && !loading">
      <p>Выберите аккаунт для входа. После входа откроется выбранный объект с вашими датами и количеством.</p>
      <v-btn class="gv-cta handoff-button" color="primary" block size="large" @click="proceed">Войти через «Города и Веси»</v-btn>
      <v-btn class="gv-cta handoff-button mt-3" variant="outlined" block size="large" :to="{ path: '/auth', query: { returnTo: returnPath } }">Войти в аккаунт Аренды</v-btn>
    </template>
    <NuxtLink class="handoff-back" :to="listingId ? returnPath : '/rental-items'">{{ listingId ? 'Вернуться к объекту' : 'К объектам аренды' }}</NuxtLink>
  </section>
</template>
<style scoped>
.handoff-page { max-width: 560px; }
.handoff-button { white-space: normal; height: auto !important; min-height: 48px; padding: 8px 12px; }
.handoff-button :deep(.v-btn__content) { white-space: normal; }
.handoff-back { display: block; margin-top: 20px; }
</style>
