<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";
import { useMyOrganization } from "~/composables/useMyOrganization";

const {
  profile,
  isLoading,
  fetchProfile,
  updateProfile,
  verifyRenter,
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

/** Цвета берём из темы бренда, а не из палитры Material. */
const businessStatusMeta = computed<{ color?: string; text: string }>(() => {
  const org = organization.value;
  if (!org) {
    return { color: undefined, text: "Заявка не подана" };
  }
  if (org.moderationStatus === "approved") {
    return { color: "success", text: "Организация подтверждена" };
  }
  if (org.moderationStatus === "pending") {
    return { color: "warning", text: "На рассмотрении" };
  }
  return { color: "error", text: "Отклонена" };
});

const showVerificationCta = computed(() => {
  const org = organization.value;
  return !org || org.moderationStatus === "rejected";
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <span class="gv-sign-eyebrow mb-3">ПРОФИЛЬ</span>
    <h1 class="gv-display text-h4 mb-6">Профиль</h1>
    <v-row>
      <v-col cols="12" md="7">
        <div class="gv-card-elevated pa-5 mb-4">
          <h2 class="text-h6 mb-4">Контактные данные</h2>
          <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-3" />
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="form.fullName" label="ФИО" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" variant="outlined" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Телефон" variant="outlined" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Адрес" variant="outlined" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.passport"
                label="Паспортные данные (для физлиц)"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-btn color="primary" class="gv-cta mt-2" @click="saveProfile">
            Сохранить профиль
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <div class="gv-card-elevated pa-5 mb-4">
          <h2 class="text-h6 mb-3">Верификация</h2>
          <div class="d-flex align-center justify-space-between mb-3">
            <span>Организация (бизнес)</span>
            <v-chip :color="businessStatusMeta.color" size="small" variant="tonal">
              {{ businessStatusMeta.text }}
            </v-chip>
          </div>
          <v-btn
            v-if="showVerificationCta"
            variant="outlined"
            color="primary"
            class="gv-cta mb-3"
            to="/business-cabinet/verification"
          >
            Заявка на верификацию бизнеса
          </v-btn>
          <div
            v-if="organization?.moderatorComment"
            class="text-caption text-medium-emphasis mb-3"
          >
            Комментарий: {{ organization.moderatorComment }}
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span>Подтверждение профиля</span>
            <v-chip :color="profile?.isRenterVerified ? 'success' : 'warning'" size="small" variant="tonal">
              {{ profile?.isRenterVerified ? "Подтвержден" : "Не подтвержден" }}
            </v-chip>
          </div>
          <v-btn
            v-if="!profile?.isRenterVerified"
            variant="outlined"
            color="primary"
            class="gv-cta"
            @click="verifyRenter"
          >
            Подтвердить профиль
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
