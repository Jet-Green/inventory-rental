<script setup lang="ts">
import { rentalHandoffQuery } from "~/utils/rentalHandoff";
definePageMeta({ path: "/auth/gorodaivesi/callback" });
useHead({ meta: [{ name: "referrer", content: "no-referrer" }] });
const error = ref("");
const back = ref("/rental-items");
const restart = ref("/rental-items");
onMounted(async () => {
  const saved = sessionStorage.getItem("rentalHandoffListing");
  let query: Record<string, string> = {};
  if (saved && /^[a-f0-9]{24}$/.test(saved)) {
    try { query = rentalHandoffQuery(JSON.parse(sessionStorage.getItem(`rentalHandoffQuery:${saved}`) || "{}")); } catch {}
    const search = new URLSearchParams(query).toString();
    back.value = `/rental-item/${saved}` + (search ? `?${search}` : "");
    restart.value = `/auth/gorodaivesi?${new URLSearchParams({ listingId: saved, ...query })}`;
  }
  const params = new URLSearchParams(window.location.hash.slice(1));
  const code = params.get("code");
  const state = params.get("state");
  // Remove the short-lived code from browser history before any other navigation.
  window.history.replaceState({}, "", "/auth/gorodaivesi/callback");
  if (typeof code !== "string" || !/^[a-f0-9]{64}$/.test(code) || typeof state !== "string" || !/^[a-f0-9]{64}$/.test(state)) {
    error.value = "Некорректная ссылка для входа."; return;
  }
  try {
    const data = await useNuxtApp().$apiFetch<{ user: import("~/types/rental").IUserProfile; path: string }>("/auth/gorodaivesi/complete", { method: "POST", retry: 0, body: { code, state } });
    if (!/^\/rental-item\/[a-f0-9]{24}$/.test(data.path)) throw new Error("Invalid destination");
    useAuth().setUser(data.user);
    sessionStorage.removeItem("rentalHandoffListing");
    await navigateTo({ path: data.path, query: data.path === `/rental-item/${saved}` ? query : {} }, { replace: true });
  } catch (e: any) {
    error.value = e?.data?.message || "Не удалось завершить вход. Вернитесь к объекту и начните заново.";
  }
});
</script>
<template><section class="page-container py-8"><h1>Вход в Аренду</h1><p>{{ error || "Завершаем вход…" }}</p><NuxtLink v-if="error" :to="restart">Повторить вход через «Города и Веси»</NuxtLink><br><NuxtLink v-if="error" :to="`/auth?returnTo=${encodeURIComponent(back)}`">Войти в существующий аккаунт Аренды</NuxtLink><br><NuxtLink :to="back">Вернуться к объекту</NuxtLink></section></template>
