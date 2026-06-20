<script setup lang="ts">
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: ["auth", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";
import { useMyOrganization } from "~/composables/useMyOrganization";
import type { IDadataCompany } from "~/types/rental";

const route = useRoute();
const router = useRouter();
const { profile, fetchProfile, submitOrganizationVerification } = useAuthProfile();
const { organization, fetchMine } = useMyOrganization();

const entity = ref<"person" | "ip" | "ooo">("ip");
const isSubmitting = ref(false);
const submitError = ref("");

const form = reactive({
  inn: "",
  ogrnOrOgrnip: "",
  companyName: "",
  payoutDetails: "",
});

const canSubmit = computed(() => {
  const org = organization.value;
  return !org || org.moderationStatus === "rejected";
});

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

/** Заполняет поля наименованием/ОГРН/ИНН из ответа DaData. */
function applyDadata(company: IDadataCompany): void {
  form.inn = company.inn || form.inn;
  form.ogrnOrOgrnip = company.ogrn || form.ogrnOrOgrnip;
  form.companyName = company.shortName || company.name || form.companyName;
}

function fillFormFromOrganization(): void {
  const org = organization.value;
  if (org?.legalStatus) {
    entity.value = org.legalStatus;
  }
  if (org) {
    form.inn = org.inn || "";
    form.ogrnOrOgrnip = org.ogrnOrOgrnip || "";
    form.companyName = org.companyName || profile.value?.fullName || "";
    form.payoutDetails = org.payoutPhone || "";
  }
}

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchMine()]);
  fillFormFromOrganization();
});

async function submit(): Promise<void> {
  submitError.value = "";
  const inn = form.inn.trim();
  const ogrnOrOgrnip = form.ogrnOrOgrnip.trim();
  const companyName = form.companyName.trim();
  const payoutPhone = form.payoutDetails.trim();

  const needsOgrn = entity.value !== "person";
  if (!inn || !companyName || !payoutPhone || (needsOgrn && !ogrnOrOgrnip)) {
    submitError.value = "Заполните все обязательные поля перед отправкой.";
    return;
  }

  isSubmitting.value = true;
  try {
    await submitOrganizationVerification({
      legalStatus: entity.value,
      inn,
      ogrnOrOgrnip,
      companyName,
      payoutPhone,
    });
    toast("Заявка отправлена на проверку.", { type: "success", autoClose: 5000 });
  } catch {
    submitError.value = "Не удалось отправить заявку. Проверьте поля и попробуйте снова.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Верификация бизнеса</h1>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Выберите тип и заполните реквизиты для договоров и выплат.
    </p>

    <div class="d-flex align-center ga-3 mb-6">
      <span class="text-body-2">Статус:</span>
      <StatusChip
        v-if="organization"
        :status="organization.moderationStatus"
        type="verification"
      />
      <v-chip v-else size="small" variant="tonal">Заявка не отправлена</v-chip>
    </div>

    <p
      v-if="organization?.moderatorComment && organization.moderationStatus === 'rejected'"
      class="text-caption text-error mb-4"
    >
      Комментарий модератора: {{ organization.moderatorComment }}
    </p>

    <template v-if="canSubmit">
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

      <div style="max-width: 480px">
        <DadataSuggest
          v-if="entity !== 'person'"
          v-model="form.inn"
          label="ИНН (автоподтягивание по DaData)"
          @apply="applyDadata"
        />
        <v-text-field
          v-else
          v-model="form.inn"
          label="ИНН"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />
      </div>
      <v-text-field
        v-if="entity !== 'person'"
        v-model="form.ogrnOrOgrnip"
        :label="entity === 'ip' ? 'ОГРНИП' : 'ОГРН'"
        variant="outlined"
        rounded="lg"
        class="mb-3"
        style="max-width: 480px"
      />
      <v-text-field
        v-model="form.companyName"
        label="Наименование / ФИО"
        variant="outlined"
        rounded="lg"
        class="mb-3"
        hide-details
      />
      <v-text-field
        v-model="form.payoutDetails"
        label="Реквизиты для выплат (телефон / СБП / счёт)"
        variant="outlined"
        rounded="lg"
        class="mb-4"
        hide-details
      />

      <p v-if="submitError" class="text-error text-caption mb-3">
        {{ submitError }}
      </p>

      <v-btn
        color="primary"
        class="gv-cta"
        rounded="lg"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="submit"
      >
        Отправить на проверку
      </v-btn>
    </template>

    <div
      v-else-if="organization?.moderationStatus === 'pending'"
      class="verification-pending rounded-lg pa-4 d-flex align-center ga-3"
    >
      <v-icon icon="mdi-clock-outline" size="24" color="warning" />
      <span class="text-body-2">
        Заявка на рассмотрении. После одобрения откроются разделы кабинета бизнеса.
      </span>
    </div>
    <p v-else-if="organization?.moderationStatus === 'approved'" class="text-body-2 text-medium-emphasis">
      Организация подтверждена.
      <NuxtLink to="/business-cabinet" class="gv-link">Перейти в кабинет</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.verification-pending {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
  max-width: 480px;
}
</style>
