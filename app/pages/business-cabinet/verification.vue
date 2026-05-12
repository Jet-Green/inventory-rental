<script setup lang="ts">
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: ["auth", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";

const route = useRoute();
const router = useRouter();
const { profile, fetchProfile, requestBusinessVerification, updateProfile } = useAuthProfile();

const entity = ref<"person" | "ip" | "ooo">("ip");

const form = reactive({
  inn: "",
  ogrnOrOgrnip: "",
  companyName: "",
  payoutDetails: "",
});

/** При кликах по сайдбару Nuxt часто переиспользует эту страницу — onMounted не срабатывает снова, нужен watch на query. */
watch(
  () => route.query.needBusinessVerification,
  async (need) => {
    if (need !== "1") return;
    if (import.meta.server) return;
    await router.replace({ path: route.path, query: {} });
    await nextTick();
    toast(
      "Сначала заполните и отправьте заявку на верификацию бизнеса — без неё разделы кабинета недоступны.",
      { type: "warning", autoClose: 6000 },
    );
  },
  { immediate: true },
);

onMounted(async () => {
  await fetchProfile();
  if (profile.value?.status) {
    entity.value = profile.value.status;
  }
  form.inn = profile.value?.inn || "";
  form.ogrnOrOgrnip = profile.value?.ogrnOrOgrnip || "";
  form.companyName = profile.value?.companyName || profile.value?.fullName || "";
  form.payoutDetails = profile.value?.payoutPhone || "";
});

async function submit(): Promise<void> {
  await updateProfile({
    status: entity.value,
    inn: form.inn,
    ogrnOrOgrnip: form.ogrnOrOgrnip,
    companyName: form.companyName,
    payoutPhone: form.payoutDetails,
  });
  await requestBusinessVerification();
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Верификация бизнеса</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Выберите тип и заполните реквизиты для договоров и выплат.
    </p>

    <div class="d-flex flex-wrap ga-2 mb-6">
      <v-btn
        v-for="opt in [
          { k: 'person' as const, t: 'Физлицо' },
          { k: 'ip' as const, t: 'ИП' },
          { k: 'ooo' as const, t: 'ООО' },
        ]"
        :key="opt.k"
        :variant="entity === opt.k ? 'flat' : 'outlined'"
        :color="entity === opt.k ? 'primary' : 'default'"
        class="text-caption"
        rounded="lg"
        @click="entity = opt.k"
      >
        {{ opt.t }}
      </v-btn>
    </div>

    <v-text-field
      v-model="form.inn"
      placeholder="ИНН"
      variant="outlined"
      rounded="lg"
      class="mb-3"
      style="max-width: 360px"
      hide-details
    />
    <v-text-field
      v-model="form.ogrnOrOgrnip"
      placeholder="ОГРН / ОГРНИП"
      variant="outlined"
      rounded="lg"
      class="mb-3"
      style="max-width: 360px"
      hide-details
    />
    <v-text-field
      v-model="form.companyName"
      placeholder="Наименование / ФИО"
      variant="outlined"
      rounded="lg"
      class="mb-3"
      hide-details
    />
    <v-text-field
      v-model="form.payoutDetails"
      placeholder="Реквизиты для выплат"
      variant="outlined"
      rounded="lg"
      class="mb-4"
      hide-details
    />

    <p class="text-caption text-medium-emphasis mb-4">
      Статус: черновик · документы не отправлены
    </p>

    <v-btn color="primary" class="gv-cta" rounded="lg" @click="submit">
      Отправить на проверку
    </v-btn>
  </div>
</template>
