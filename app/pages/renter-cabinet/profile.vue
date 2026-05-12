<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";

const {
  profile,
  isLoading,
  fetchProfile,
  updateProfile,
  verifyRenter,
} = useAuthProfile();

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  status: "person" as "person" | "ip" | "ooo",
  companyName: "",
  inn: "",
  ogrnOrOgrnip: "",
  payoutPhone: "",
  address: "",
  passport: "",
});

onMounted(async () => {
  await fetchProfile();
  if (profile.value) {
    Object.assign(form, profile.value);
  }
});

async function saveProfile(): Promise<void> {
  await updateProfile({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    status: form.status,
    companyName: form.companyName,
    inn: form.inn,
    ogrnOrOgrnip: form.ogrnOrOgrnip,
    payoutPhone: form.payoutPhone,
    address: form.address,
    passport: form.passport,
  });
}

const businessStatusMeta = computed(() => {
  const status = profile.value?.lessorVerificationStatus || "not_requested";
  if (status === "approved") {
    return { color: "green", text: "Подтвержден" };
  }
  if (status === "pending") {
    return { color: "orange", text: "Заявка на рассмотрении" };
  }
  if (status === "rejected") {
    return { color: "red", text: "Отклонен" };
  }
  return { color: "grey", text: "Не запрошен" };
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
              <v-text-field v-model="form.fullName" label="ФИО / Наименование" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.companyName"
                label="Наименование организации"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Телефон" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.status"
                :items="[
                  { title: 'Физлицо', value: 'person' },
                  { title: 'ИП', value: 'ip' },
                  { title: 'ООО', value: 'ooo' },
                ]"
                item-title="title"
                item-value="value"
                label="Статус"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.payoutPhone" label="Телефон для СБП" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.inn" label="ИНН" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.ogrnOrOgrnip" label="ОГРН / ОГРНИП" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Адрес" variant="outlined" rounded="lg" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.passport"
                label="Паспортные данные (для физлиц)"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
          </v-row>
          <v-btn color="primary" class="gv-cta mt-2" rounded="lg" @click="saveProfile">
            Сохранить профиль
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <div class="gv-card-elevated pa-5 mb-4">
          <h2 class="text-h6 mb-3">Верификация</h2>
          <div class="d-flex align-center justify-space-between mb-3">
            <span>Статус бизнеса</span>
            <v-chip :color="businessStatusMeta.color" size="small">
              {{ businessStatusMeta.text }}
            </v-chip>
          </div>
          <v-btn
            v-if="
              profile?.lessorVerificationStatus === 'not_requested' ||
              profile?.lessorVerificationStatus === 'rejected'
            "
            variant="outlined"
            color="primary"
            class="gv-cta mb-3"
            rounded="lg"
            to="/business-cabinet/verification"
          >
            Отправить заявку на проверку
          </v-btn>
          <div
            v-if="profile?.lessorVerificationComment"
            class="text-caption text-medium-emphasis mb-3"
          >
            Комментарий: {{ profile.lessorVerificationComment }}
          </div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span>Подтверждение профиля</span>
            <v-chip :color="profile?.isRenterVerified ? 'green' : 'orange'" size="small">
              {{ profile?.isRenterVerified ? "Подтвержден" : "Не подтвержден" }}
            </v-chip>
          </div>
          <v-btn
            v-if="!profile?.isRenterVerified"
            variant="outlined"
            color="primary"
            class="gv-cta"
            rounded="lg"
            @click="verifyRenter"
          >
            Подтвердить профиль
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
