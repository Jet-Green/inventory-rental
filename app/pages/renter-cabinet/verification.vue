<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";

const { verifyRenter, profile, fetchProfile, isLoading } = useAuthProfile();

const isVerifying = ref(false);
const actionError = ref("");
async function confirmProfile() {
  if (isVerifying.value) return;
  isVerifying.value = true;
  actionError.value = "";
  try { await verifyRenter(); }
  catch { actionError.value = "Не удалось подтвердить профиль. Попробуйте ещё раз."; }
  finally { isVerifying.value = false; }
}

onMounted(() => {
  void fetchProfile();
});
</script>

<template>
  <div class="private-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-3">Подтверждение профиля</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Подтвердите профиль — так владельцы объявлений увидят, что вам можно доверять.
    </p>
    <div class="gv-card-elevated verification-panel pa-6">
      <v-icon :icon="profile?.isRenterVerified ? 'mdi-shield-check-outline' : 'mdi-shield-account-outline'" color="primary" size="48" class="mb-5" />
      <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />
      <p class="mb-4">
        Текущий статус:
        <strong>{{ profile?.isRenterVerified ? "подтверждён" : "не подтверждён" }}</strong>
      </p>
      <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">{{ actionError }}</v-alert>
      <v-btn
        v-if="!profile?.isRenterVerified"
        color="primary"
        class="gv-cta"
        :loading="isVerifying" :disabled="isLoading" @click="confirmProfile"
      >
        Пройти проверку
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.verification-panel { max-width: 640px; padding: 36px !important; }
</style>
