<script setup lang="ts">
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: "auth",
});

import { useRole } from "~/composables/useRole";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { fetchMine } = useMyOrganization();

if (auth.user?._id) {
  await fetchMine();
}

const { isBusiness, isRenter, isAdmin } = useRole();

watch(
  () => route.query.businessAccessDenied,
  async (v) => {
    if (v !== "1") return;
    if (import.meta.server) return;
    await router.replace({ path: route.path, query: {} });
    await nextTick();
    toast(
      "Кабинет бизнеса сейчас недоступен для этого аккаунта. Войдите под другим пользователем или выберите личный кабинет.",
      { type: "warning", autoClose: 6000 },
    );
  },
  { immediate: true },
);

function goPersonalCabinet(): Promise<void> | void {
  return navigateTo("/renter-cabinet/rentals");
}

function goBusinessCabinet(): Promise<void> | void {
  if (isBusiness.value || isAdmin.value) {
    return navigateTo("/business-cabinet");
  }
  return navigateTo("/business-cabinet/verification");
}
</script>

<template>
  <div class="gv-page-wide px-4 px-sm-6 py-10">
    <h1 class="gv-display text-h3 mb-2">Выберите кабинет</h1>
    <p class="text-body-1 text-medium-emphasis mb-8">
      Один аккаунт: личный кабинет для аренды и отдельный кабинет бизнеса для объявлений. Переключайтесь в любой момент.
    </p>

    <v-row class="ga-6">
      <v-col cols="12" md="6">
        <div class="gv-card-elevated pa-7 h-100 d-flex flex-column">
          <h2 class="gv-display text-h6 mb-3">Личный кабинет</h2>
          <p class="text-body-2 text-medium-emphasis mb-6 flex-grow-1">
            Бронируйте технику, следите за заказами и документами как обычный пользователь.
          </p>
          <v-btn color="primary" block class="gv-cta" rounded="lg" @click="goPersonalCabinet">
            Войти в личный кабинет
          </v-btn>
          <p v-if="!isRenter && !isAdmin" class="text-caption text-medium-emphasis mt-3">
            Доступно после регистрации.
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div class="gv-card-elevated pa-7 h-100 d-flex flex-column">
          <h2 class="gv-display text-h6 mb-3">Кабинет бизнеса</h2>
          <p class="text-body-2 text-medium-emphasis mb-6 flex-grow-1">
            Размещайте объявления, ведите брони и выплаты как компания или предприниматель.
          </p>
          <v-btn color="primary" block class="gv-cta" rounded="lg" @click="goBusinessCabinet">
            Войти в кабинет бизнеса
          </v-btn>
          <p v-if="!isBusiness && !isAdmin" class="text-caption text-medium-emphasis mt-3">
            Нужна верификация бизнеса (реквизиты и проверка модератором).
          </p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
