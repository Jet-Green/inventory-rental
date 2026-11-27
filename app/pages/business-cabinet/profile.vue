<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { useAuthProfile } from "~/composables/useAuthProfile";
import { useMyOrganization } from "~/composables/useMyOrganization";

const { profile, isLoading, fetchProfile, updateProfile } = useAuthProfile();
const { organization, fetchMine } = useMyOrganization();

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  address: "",
  passport: "",
});

const loadError = ref(false);
const saving = ref(false);
const saveMessage = ref("");
const saveError = ref(false);
async function load(): Promise<void> {
  loadError.value = false;
  try {
    await Promise.all([fetchProfile(), fetchMine()]);
  } catch {
    loadError.value = true;
    return;
  }
  if (profile.value) {
    form.fullName = profile.value.fullName || "";
    form.email = profile.value.email || "";
    form.phone = profile.value.phone || "";
    form.address = profile.value.address || "";
    form.passport = profile.value.passport || "";
  }
}
onMounted(() => {
  void load();
});

async function saveProfile(): Promise<void> {
  if (saving.value || isLoading.value || loadError.value) return;
  saveMessage.value = "";
  saveError.value = false;
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    saveError.value = true;
    saveMessage.value = "Укажите корректный email.";
    return;
  }
  saving.value = true;
  try {
    await updateProfile({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      passport: form.passport,
    });
    saveMessage.value = "Профиль сохранён.";
  } catch {
    saveError.value = true;
    saveMessage.value = "Не удалось сохранить профиль. Попробуйте снова.";
  } finally {
    saving.value = false;
  }
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
  <div class="business-page px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-6">Профиль</h1>
    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
      title="Не удалось загрузить данные"
    >
      <v-btn variant="text" :disabled="isLoading" @click="load"
        >Повторить</v-btn
      >
    </v-alert>
    <v-row>
      <v-col cols="12" md="7">
        <div class="business-panel mb-4">
          <h2 class="text-h6 mb-4">Контактные данные</h2>
          <v-progress-linear
            v-if="isLoading"
            indeterminate
            color="primary"
            class="mb-3"
          />
          <form @submit.prevent="saveProfile">
            <p class="business-muted mb-4">Личные данные</p>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.fullName"
                  label="ФИО"
                  autocomplete="name"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  autocomplete="email"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phone"
                  label="Телефон"
                  type="tel"
                  autocomplete="tel"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address"
                  label="Адрес"
                  autocomplete="street-address"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.passport"
                  label="Паспортные данные (при необходимости)"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-btn
              type="submit"
              color="primary"
              class="gv-cta mt-2"
              :loading="saving"
              :disabled="isLoading || loadError || saving"
            >
              Сохранить профиль
            </v-btn>
            <p
              v-if="saveMessage"
              role="status"
              :class="saveError ? 'text-error' : 'text-success'"
              class="text-body-2 mt-3"
            >
              {{ saveMessage }}
            </p>
          </form>
          <p class="text-caption text-medium-emphasis mt-4">
            Реквизиты организации и верификация бизнеса — в разделе
            <NuxtLink to="/business-cabinet/verification" class="gv-link"
              >заявки на проверку</NuxtLink
            >.
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <div class="business-panel mb-4">
          <h2 class="text-h6 mb-3">Верификация организации</h2>
          <div
            class="d-flex flex-wrap ga-3 align-center justify-space-between mb-3"
          >
            <span>Статус</span>
            <v-chip
              :color="businessStatusMeta.color"
              size="small"
              variant="tonal"
            >
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
            {{
              organization?.moderationStatus === "rejected"
                ? "Подать снова"
                : "Отправить заявку"
            }}
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
<style scoped>
.business-page {
  max-width: 1180px;
}
.business-panel :deep(.v-field) {
  background: var(--gv-bg-page);
}
</style>
