<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { useAdminDashboard } from "~/composables/useAdminDashboard";

const {
  dashboard,
  listings,
  organizationVerificationRequests,
  isLoading,
  fetchAdminData,
  approveOrganizationVerification,
  rejectOrganizationVerification,
} = useAdminDashboard();

onMounted(() => {
  void fetchAdminData();
});

const pendingModeration = computed(() =>
  (listings.value || []).filter((l) => l.moderationStatus === "pending").slice(0, 4),
);
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-6">Дашборд</h1>
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-1">
            Модерация: {{ dashboard.listingsStats?.pending ?? 0 }}
          </p>
          <p class="text-caption" style="color: var(--gv-link)">+4% к вчера</p>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-1">
            Новые пользователи: {{ dashboard.usersCount ?? 0 }}
          </p>
          <p class="text-caption" style="color: var(--gv-link)">+4% к вчера</p>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-1">Брони за сутки: 26</p>
          <p class="text-caption" style="color: var(--gv-link)">+4% к вчера</p>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-3">Объявления на модерации</p>
          <p
            v-for="item in pendingModeration"
            :key="item._id"
            class="text-caption text-medium-emphasis mb-2"
          >
            {{ item.title }} · {{ item.ownerId.slice(0, 8) }}…
          </p>
          <p v-if="!pendingModeration.length" class="text-caption text-medium-emphasis">
            Нет очереди
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-3">Новые пользователи</p>
          <p
            v-for="org in organizationVerificationRequests.slice(0, 3)"
            :key="org._id"
            class="text-caption text-medium-emphasis mb-2"
          >
            + Организация · {{ org.companyName || org.inn }}
          </p>
          <p v-if="!organizationVerificationRequests.length" class="text-caption text-medium-emphasis">
            Нет новых
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="gv-card-elevated pa-4">
          <p class="text-body-2 font-weight-semibold mb-3">Последние брони</p>
          <p class="text-caption text-medium-emphasis mb-2">BRN-…9184 · оплачено</p>
          <p class="text-caption text-medium-emphasis">BRN-…9170 · ожидает</p>
        </div>
      </v-col>
    </v-row>

    <v-card class="pa-4 mt-8 rounded-lg" variant="outlined">
      <h3 class="text-h6 mb-3">Верификация организаций</h3>
      <v-table>
        <thead>
          <tr>
            <th>Организация</th>
            <th>ИНН</th>
            <th>Менеджер</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in organizationVerificationRequests" :key="org._id">
            <td>{{ org.companyName || "—" }}</td>
            <td>{{ org.inn || "—" }}</td>
            <td>
              {{
                org.orgManagers?.map((m) => m.email).join(", ") || "—"
              }}
            </td>
            <td>{{ org.moderationStatus }}</td>
            <td>
              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="success"
                  @click="approveOrganizationVerification(org._id)"
                >
                  Подтвердить
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="error"
                  @click="rejectOrganizationVerification(org._id, 'Требуются уточнения')"
                >
                  Отклонить
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
