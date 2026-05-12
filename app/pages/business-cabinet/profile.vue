<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";
import { useMyOrganization } from "~/composables/useMyOrganization";

const {
  profile,
  isLoading,
  fetchProfile,
  updateProfile,
} = useAuthProfile();
const { organization, fetchMine } = useMyOrganization();

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  address: "",
  passport: "",
});

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchMine()]);
  if (profile.value) {
    form.fullName = profile.value.fullName || "";
    form.email = profile.value.email || "";
    form.phone = profile.value.phone || "";
    form.address = profile.value.address || "";
    form.passport = profile.value.passport || "";
  }
});

async function saveProfile(): Promise<void> {
  await updateProfile({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    passport: form.passport,
  });
}

const businessStatusMeta = computed(() => {
  const org = organization.value;
  if (!org) {
    return { color: "grey" as const, text: "Заявка не подана" };
  }
  if (org.moderationStatus === "approved") {
    return { color: "green" as const, text: "Организация подтверждена" };
  }
  if (org.moderationStatus === "pending") {
    return { color: "orange" as const, text: "На рассмотрении" };
  }
  return { color: "red" as const, text: "Отклонена" };
});

const showVerificationCta = computed(() => {
  const org = organization.value;
  return !org || org.moderationStatus === "rejected";
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Профиль</h1>
    <v-row>
      <v-col cols="12" md="7">
        <div class="gv-card-elevated pa-5 mb-4">
          <h2 class="text-h6 mb-4">Контактные данные</h2>
          <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-3" />
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="form.fullName" label="ФИО" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Телефон" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Адрес" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.passport"
                label="Паспортные данные (при необходимости)"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
          </v-row>
          <v-btn color="primary" class="gv-cta mt-2" rounded="lg" @click="saveProfile">
            Сохранить профиль
          </v-btn>
          <p class="text-caption text-medium-emphasis mt-4">
            Реквизиты организации и верификация бизнеса — в разделе
            <NuxtLink to="/business-cabinet/verification" class="gv-link">заявки на проверку</NuxtLink>.
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <div class="gv-card-elevated pa-5 mb-4">
          <h2 class="text-h6 mb-3">Верификация организации</h2>
          <div class="d-flex align-center justify-space-between mb-3">
            <span>Статус</span>
            <v-chip :color="businessStatusMeta.color" size="small">
              {{ businessStatusMeta.text }}
            </v-chip>
          </div>
          <v-btn
            v-if="showVerificationCta"
            variant="outlined"
            color="primary"
            class="gv-cta mb-3"
            rounded="lg"
            to="/business-cabinet/verification"
          >
            {{ organization?.moderationStatus === "rejected" ? "Подать снова" : "Отправить заявку" }}
          </v-btn>
          <div
            v-if="organization?.moderatorComment"
            class="text-caption text-medium-emphasis mb-3"
          >
            Комментарий: {{ organization.moderatorComment }}
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
