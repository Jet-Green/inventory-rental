<script setup lang="ts">
import { rentalHandoffQuery, rentalReturnPath } from "~/utils/rentalHandoff";
definePageMeta({ path: "/auth/gorodaivesi" });
const route = useRoute();
const error = ref("");
const listingId = typeof route.query.listingId === "string" && /^[a-f0-9]{24}$/.test(route.query.listingId) ? route.query.listingId : "";
onMounted(async () => {
  if (!listingId) { error.value = "Объект не найден. Вернитесь в каталог."; return; }
  sessionStorage.setItem("rentalHandoffListing", listingId);
  sessionStorage.setItem(`rentalHandoffQuery:${listingId}`, JSON.stringify(rentalHandoffQuery(route.query)));
  try {
    const result = await useNuxtApp().$apiFetch<{ url: string }>("/auth/federation/start", { method: "POST", retry: 0, body: { returnPath: rentalReturnPath(`/rental-item/${listingId}?${new URLSearchParams(rentalHandoffQuery(route.query))}`) } });
    const target = new URL(result.url);
    if (target.origin !== 'https://gorodaivesi.ru' || target.pathname !== '/federation/authorize') throw new Error('Invalid destination');
    window.location.replace(target.href);
  } catch { error.value = "Не удалось начать вход. Попробуйте ещё раз из карточки объекта."; }
});
</script>
<template><section class="page-container py-8"><h1>Вход через «Города и Веси»</h1><p>{{ error || "Переходим к вашему аккаунту…" }}</p><NuxtLink :to="listingId ? `/rental-item/${listingId}` : '/rental-items'">Вернуться к объекту</NuxtLink></section></template>
