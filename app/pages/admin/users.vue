<script setup lang="ts">
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { useAdminDashboard } from "~/composables/useAdminDashboard";
import type { IOrganization, LegalStatus } from "~/types/rental";

const {
  organizationVerificationRequests,
  isLoading,
  fetchOrganizationVerificationRequests,
  approveOrganizationVerification,
  rejectOrganizationVerification,
} = useAdminDashboard();

const rejectDialogOpen = ref(false);
const rejectTargetId = ref("");
const rejectComment = ref("");

const legalStatusLabel: Record<LegalStatus, string> = {
  person: "Физлицо",
  ip: "ИП",
  ooo: "ООО",
};

const moderationStatusLabel: Record<
  IOrganization["moderationStatus"],
  string
> = {
  pending: "На проверке",
  approved: "Подтверждена",
  rejected: "Отклонена",
};

onMounted(() => {
  void fetchOrganizationVerificationRequests();
});

function managerLines(org: IOrganization): string[] {
  const managers = org.orgManagers || [];
  if (!managers.length) return ["—"];
  return managers.map((m) => {
    if (typeof m === "string") return m;
    const parts = [m.fullName, m.email].filter(Boolean);
    return parts.length ? parts.join(" · ") : m._id;
  });
}

function openReject(orgId: string): void {
  rejectTargetId.value = orgId;
  rejectComment.value = "Требуются уточнения по реквизитам.";
  rejectDialogOpen.value = true;
}

async function confirmReject(): Promise<void> {
  if (!rejectTargetId.value) return;
  await rejectOrganizationVerification(
    rejectTargetId.value,
    rejectComment.value.trim() || "Заявка отклонена",
  );
  rejectDialogOpen.value = false;
  toast("Заявка отклонена.", { type: "info", autoClose: 4000 });
}

async function approve(orgId: string): Promise<void> {
  await approveOrganizationVerification(orgId);
  toast("Организация подтверждена.", { type: "success", autoClose: 4000 });
}
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-2">Пользователи</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Заявки на верификацию организаций (кабинет бизнеса). Подтвердите или отклоните — менеджеру
      придёт статус в личном кабинете.
    </p>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="gv-card-elevated admin-users-card overflow-hidden rounded-lg">
      <v-table class="admin-users-table">
        <thead>
          <tr>
            <th>Организация</th>
            <th>Тип</th>
            <th>ИНН</th>
            <th>ОГРН / ОГРНИП</th>
            <th>Выплаты</th>
            <th>Менеджер</th>
            <th>Статус</th>
            <th class="text-end">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in organizationVerificationRequests" :key="org._id">
            <td class="font-weight-medium">
              {{ org.companyName || "—" }}
            </td>
            <td>{{ legalStatusLabel[org.legalStatus] || org.legalStatus }}</td>
            <td>{{ org.inn || "—" }}</td>
            <td>{{ org.ogrnOrOgrnip || "—" }}</td>
            <td class="text-caption" style="max-width: 160px">
              {{ org.payoutPhone || "—" }}
            </td>
            <td class="text-caption">
              <div v-for="(line, i) in managerLines(org)" :key="i">
                {{ line }}
              </div>
            </td>
            <td>
              <v-chip
                size="small"
                :color="
                  org.moderationStatus === 'pending'
                    ? 'orange'
                    : org.moderationStatus === 'approved'
                      ? 'green'
                      : 'red'
                "
                variant="tonal"
              >
                {{ moderationStatusLabel[org.moderationStatus] }}
              </v-chip>
            </td>
            <td class="text-end">
              <div
                v-if="org.moderationStatus === 'pending'"
                class="d-flex ga-2 justify-end flex-wrap"
              >
                <v-btn
                  size="small"
                  color="success"
                  variant="outlined"
                  class="gv-cta"
                  :disabled="isLoading"
                  @click="approve(org._id)"
                >
                  Подтвердить
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="outlined"
                  class="gv-cta"
                  :disabled="isLoading"
                  @click="openReject(org._id)"
                >
                  Отклонить
                </v-btn>
              </div>
              <span v-else class="text-caption text-medium-emphasis">—</span>
            </td>
          </tr>
          <tr v-if="!isLoading && !organizationVerificationRequests.length">
            <td colspan="8" class="text-center text-medium-emphasis py-8">
              Нет заявок на проверке
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog v-model="rejectDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6">Отклонить заявку</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="rejectComment"
            label="Комментарий для пользователя"
            variant="outlined"
            rounded="lg"
            rows="3"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="rejectDialogOpen = false">
            Отмена
          </v-btn>
          <v-btn
            color="error"
            class="gv-cta"
            rounded="lg"
            :loading="isLoading"
            @click="confirmReject"
          >
            Отклонить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.admin-users-card {
  padding: 20px 20px 24px;
}

.admin-users-table :deep(table) {
  border-collapse: separate;
  border-spacing: 0;
}

.admin-users-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  white-space: nowrap;
  padding: 12px 16px 14px !important;
  vertical-align: middle;
}

.admin-users-table :deep(td) {
  font-size: 13px;
  padding: 18px 16px !important;
  vertical-align: middle;
}

.admin-users-table :deep(tbody tr:first-child td) {
  padding-top: 20px !important;
}

.admin-users-table :deep(thead tr:first-child th:first-child) {
  padding-top: 4px !important;
}
</style>
