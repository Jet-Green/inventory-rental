<script setup lang="ts">
import { rentalHandoffQuery } from "~/utils/rentalHandoff";
import { useRentalItem } from "~/composables/useRentalItem";
import { useRole } from "~/composables/useRole";

const route = useRoute();
const { categories } = useRentalCatalog();
const id = String(route.params.id || "");

const { currentListing, fetchListingById, isLoading } = useRentalItem();
const { isRenter, isAdmin, isAuth } = useRole();

const selectedPhoto = ref(0);

onMounted(() => {
  void fetchListingById(id);
});

watch(
  () => route.params.id,
  (next) => {
    const nid = String(next || "");
    if (nid) {
      void fetchListingById(nid);
    }
  },
);

watch(
  () => currentListing.value?.photos,
  (photos) => {
    if (!photos?.length) selectedPhoto.value = 0;
    else if (selectedPhoto.value >= photos.length) selectedPhoto.value = 0;
  },
  { immediate: true },
);

const pickupLabel = computed(() => {
  const l = currentListing.value;
  if (!l) return "";
  if (l.pickupType === "pickup") return "самовывоз";
  if (l.pickupType === "delivery") return "доставка";
  return "самовывоз или доставка";
});

const categoriesLine = computed(() => {
  const l = currentListing.value;
  if (!l?.categories?.length) return "";
  return l.categories
    .map((c) => (typeof c === "string" ? categories.value.find(category => category.key === c)?.name || c : c?.name))
    .filter(Boolean)
    .join(" · ");
});

const bookingHint = computed(() => {
  if (!isAuth.value) return "Для бронирования войдите в аккаунт.";
  if (!isRenter.value && !isAdmin.value) {
    return "Бронирование доступно для подтверждённого пользователя.";
  }
  return "";
});

function startBooking(): void {
  if (!currentListing.value) return;
  if (!isAuth.value) {
    navigateTo({ path: "/auth", query: { returnTo: `/rental-item/${id}?${new URLSearchParams(rentalHandoffQuery(route.query))}` } });
    return;
  }
  if (!isRenter.value && !isAdmin.value) return;
  navigateTo({ path: `/booking/${currentListing.value._id}`, query: rentalHandoffQuery(route.query) });
}

useSeoMeta({
  title: currentListing.value?.title
    ? `${currentListing.value.title} — Аренда инвентаря`
    : "Объявление",
  description: currentListing.value?.description || "Аренда инвентаря",
});
</script>

<template>
  <div class="listing-page pb-12 pt-6">
    <v-progress-linear v-if="isLoading" indeterminate color="primary" />
    <div v-if="currentListing" class="gv-page-wide px-4 px-sm-6">
      <NuxtLink to="/listings" class="listing-page__back"><v-icon icon="mdi-arrow-left" size="18" /> Каталог аренды</NuxtLink>
      <header class="listing-page__heading"><h1 class="gv-display">{{ currentListing.title }}</h1><p>{{ categoriesLine }}</p></header>
      <div class="listing-page__layout">
        <div class="listing-page__content">
          <div class="listing-page__hero">
            <v-img v-if="currentListing.photos?.[selectedPhoto]" :src="currentListing.photos[selectedPhoto]" :alt="currentListing.title" cover class="listing-page__hero-img" />
            <div v-else class="listing-page__no-photo"><v-icon icon="mdi-image-outline" size="48" /><span>Фото скоро появится</span></div>
            <span v-if="currentListing.photos?.length" class="listing-page__photo-count">{{ selectedPhoto + 1 }} / {{ currentListing.photos.length }}</span>
          </div>
          <div v-if="(currentListing.photos?.length || 0) > 1" class="listing-page__thumbs">
            <button v-for="(ph, idx) in currentListing.photos" :key="idx" type="button" class="listing-page__thumb" :class="{ 'listing-page__thumb--active': selectedPhoto === idx }" :aria-label="`Показать фото ${idx + 1}`" :aria-pressed="selectedPhoto === idx" @click="selectedPhoto = idx"><v-img :src="ph" alt="" cover height="64" width="88" /></button>
          </div>
          <section class="listing-page__description"><h2>Об инвентаре</h2><p>{{ currentListing.description || 'Арендодатель пока не добавил описание.' }}</p></section>
          <section class="listing-page__calendar"><RentalCalendar :ranges="currentListing.calendar" /></section>
        </div>
        <aside class="gv-card-elevated listing-page__cta">
          <p class="listing-page__price">{{ new Intl.NumberFormat('ru-RU').format(currentListing.pricePerDay) }} ₽ <span>/ день</span></p>
          <p class="text-body-2 text-medium-emphasis mb-5">Выберите период на следующем шаге</p>
          <dl class="listing-page__facts"><div><dt>Минимальный срок</dt><dd>{{ currentListing.minDays }} дн.</dd></div><div><dt>В наличии</dt><dd>{{ currentListing.unitsAvailable }} ед.</dd></div><div><dt>Получение</dt><dd>{{ pickupLabel }}</dd></div></dl>
          <v-btn block color="primary" class="gv-cta" size="large" :disabled="(!!bookingHint && isAuth) || currentListing.unitsAvailable < 1" @click="startBooking">{{ currentListing.unitsAvailable < 1 ? 'Нет в наличии' : 'Забронировать' }}</v-btn>
          <p v-if="bookingHint" class="text-caption text-medium-emphasis mt-3">{{ bookingHint }}</p>
          <div class="listing-page__next"><v-icon icon="mdi-file-document-outline" size="20" /><span>Период, проверка заказа и контакты — всё в одном оформлении.</span></div>
        </aside>
      </div>
    </div>
    <div v-else-if="!isLoading" class="gv-page-wide pa-8"><EmptyState title="Объявление недоступно" description="Возможно, арендодатель снял его с публикации. Выберите другой инвентарь в каталоге." action-title="В каталог" @action="navigateTo('/listings')" /></div>
  </div>
</template>
<style scoped>
.listing-page__back { display:inline-flex; gap:8px; align-items:center; color:var(--gv-text-secondary); text-decoration:none; font-size:14px; }
.listing-page__heading { margin:24px 0; }
.listing-page__heading h1 { font-size:clamp(25px, 2.6vw, 38px); line-height:1.2; max-width:950px; }
.listing-page__heading p { margin-top:12px; color:var(--gv-text-secondary); }
.listing-page__layout { display:grid; grid-template-columns:minmax(0, 1fr) 350px; gap:32px; align-items:start; }
.listing-page__content { min-width:0; }
.listing-page__hero { position:relative; background:var(--gv-border-light); border-radius:var(--gv-radius-card); overflow:hidden; }
.listing-page__hero-img { aspect-ratio: 16 / 10; }
.listing-page__no-photo { min-height:260px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; color:var(--gv-text-muted); }
.listing-page__photo-count { position:absolute; right:16px; bottom:16px; background:rgba(0,0,0,.65); color:white; padding:5px 12px; border-radius:20px; font-size:13px; }
.listing-page__thumbs { display:flex; gap:10px; overflow-x:auto; padding:12px 2px; }
.listing-page__thumb { padding:0; border:2px solid transparent; border-radius:10px; overflow:hidden; flex-shrink:0; cursor:pointer; }
.listing-page__thumb--active { border-color:var(--gv-primary); }
.listing-page__cta { position:sticky; top:24px; padding:26px; }
.listing-page__price { font-size:30px; font-weight:800; margin-bottom:6px; }
.listing-page__price span { font-size:15px; font-weight:400; color:var(--gv-text-secondary); }
.listing-page__facts { margin-bottom:24px; }
.listing-page__facts div { display:flex; justify-content:space-between; align-items:start; gap:16px; padding:12px 0; border-top:1px solid var(--gv-border-light); font-size:14px; }
.listing-page__facts dt { color:var(--gv-text-secondary); }
.listing-page__facts dd { margin:0; text-align:right; }
.listing-page__next { display:flex; gap:10px; margin-top:24px; padding-top:20px; border-top:1px solid var(--gv-border-light); font-size:13px; line-height:1.5; color:var(--gv-text-secondary); }
.listing-page__description { padding:30px 0; }
.listing-page__description h2 { font-size:23px; margin-bottom:16px; }
.listing-page__description p { white-space:pre-line; color:var(--gv-text-secondary); line-height:1.7; }
@media(max-width:959px) { .listing-page__layout { grid-template-columns:minmax(0,1fr); gap:24px; } .listing-page__cta { position:static; grid-row:1; } .listing-page__content { display:contents; } .listing-page__hero { grid-row:1; } .listing-page__thumbs { grid-row:2; } .listing-page__cta { grid-row:3; } .listing-page__description { padding:8px 0; } }
@media(max-width:599px) { .listing-page__cta { padding:20px; } .listing-page__layout { gap:18px; } .listing-page__heading { margin:20px 0; } .listing-page__hero-img { aspect-ratio:4 / 3; } }
</style>
