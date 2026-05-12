<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";

const { verifyRenter, profile, fetchProfile } = useAuthProfile();

onMounted(() => {
  void fetchProfile();
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-3">Подтверждение профиля</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Подтвердите профиль — так владельцы объявлений увидят, что вам можно доверять.
    </p>
    <div class="gv-card-elevated pa-6 max-w-lg">
      <p class="mb-4">
        Текущий статус:
        <strong>{{ profile?.isRenterVerified ? "подтверждён" : "не подтверждён" }}</strong>
      </p>
      <v-btn
        v-if="!profile?.isRenterVerified"
        color="primary"
        class="gv-cta"
        rounded="lg"
        @click="verifyRenter"
      >
        Пройти проверку
      </v-btn>
    </div>
  </div>
</template>
