<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { toast } from "vue3-toastify";
import { useAdminUsers } from "~/composables/useAdminUsers";
import type { IAdminUser, UserRole } from "~/types/rental";

const {
  users,
  isLoading,
  roleFilter,
  verificationFilter,
  fetchUsers,
  setBlocked,
} = useAdminUsers();

const blockDialogOpen = ref(false);
const blockTarget = ref<IAdminUser | null>(null);
const isActing = ref(false);

const ROLE_FILTERS: Array<{ value: UserRole | null; label: string }> = [
  { value: null, label: "Все" },
  { value: "renter", label: "Арендатор" },
  { value: "business", label: "Арендодатель" },
];

const VERIFICATION_FILTERS: Array<{
  value: "pending" | "approved" | "rejected" | null;
  label: string;
}> = [
  { value: null, label: "Все" },
  { value: "pending", label: "На проверке" },
  { value: "approved", label: "Подтверждён" },
  { value: "rejected", label: "Отклонён" },
];

onMounted(() => {
  void fetchUsers();
});

watch([roleFilter, verificationFilter], () => {
  void fetchUsers();
});

function roleLabel(roles: UserRole[]): string {
  if (roles.includes("admin")) return "Админ";
  if (roles.includes("business")) return "Арендодатель";
  if (roles.includes("renter")) return "Арендатор";
  return "—";
}

function initials(user: IAdminUser): string {
  const source = user.fullName || user.email || "?";
  return source.trim().charAt(0).toUpperCase();
}

function openBlock(user: IAdminUser): void {
  blockTarget.value = user;
  blockDialogOpen.value = true;
}

async function confirmBlock(): Promise<void> {
  if (!blockTarget.value) return;
  const next = !blockTarget.value.isBlocked;
  isActing.value = true;
  try {
    await setBlocked(blockTarget.value.id, next);
    blockDialogOpen.value = false;
    toast(next ? "Пользователь заблокирован." : "Пользователь разблокирован.", {
      type: "info",
      autoClose: 4000,
    });
  } finally {
    isActing.value = false;
  }
}
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-2">Пользователи</h1>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Все пользователи платформы с агрегатами по объявлениям и броням.
    </p>

    <div class="d-flex flex-column ga-2 mb-4">
      <div class="d-flex align-center ga-2 flex-wrap">
        <span class="text-caption text-medium-emphasis" style="min-width: 90px">Роль:</span>
        <v-chip
          v-for="opt in ROLE_FILTERS"
          :key="opt.label"
          size="small"
          :variant="roleFilter === opt.value ? 'flat' : 'outlined'"
          :color="roleFilter === opt.value ? 'primary' : undefined"
          @click="roleFilter = opt.value"
        >
          {{ opt.label }}
        </v-chip>
      </div>
      <div class="d-flex align-center ga-2 flex-wrap">
        <span class="text-caption text-medium-emphasis" style="min-width: 90px">Верификация:</span>
        <v-chip
          v-for="opt in VERIFICATION_FILTERS"
          :key="opt.label"
          size="small"
          :variant="verificationFilter === opt.value ? 'flat' : 'outlined'"
          :color="verificationFilter === opt.value ? 'primary' : undefined"
          @click="verificationFilter = opt.value"
        >
          {{ opt.label }}
        </v-chip>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="gv-card-elevated overflow-hidden rounded-lg admin-users-table">
      <v-table>
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Верификация</th>
            <th class="text-center">Объявл.</th>
            <th class="text-center">Брони</th>
            <th>Аккаунт</th>
            <th class="text-end">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar size="28" color="primary" class="text-caption">
                  {{ initials(user) }}
                </v-avatar>
                <div>
                  <p class="font-weight-medium mb-0">{{ user.fullName || "—" }}</p>
                  <p class="text-caption text-medium-emphasis mb-0">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <v-chip size="small" variant="tonal">{{ roleLabel(user.roles) }}</v-chip>
            </td>
            <td>
              <StatusChip
                v-if="user.organizationStatus !== 'none'"
                :status="user.organizationStatus"
                type="verification"
              />
              <span v-else class="text-caption text-medium-emphasis">—</span>
            </td>
            <td class="text-center">{{ user.listingsCount }}</td>
            <td class="text-center">{{ user.bookingsCount }}</td>
            <td>
              <v-chip
                size="small"
                variant="tonal"
                :color="user.isBlocked ? 'error' : 'success'"
              >
                {{ user.isBlocked ? "Заблокирован" : "Активен" }}
              </v-chip>
            </td>
            <td class="text-end">
              <v-btn
                size="small"
                variant="outlined"
                :color="user.isBlocked ? 'success' : 'error'"
                class="gv-cta"
                @click="openBlock(user)"
              >
                {{ user.isBlocked ? "Разблок." : "Заблок." }}
              </v-btn>
            </td>
          </tr>
          <tr v-if="!isLoading && !users.length">
            <td colspan="7" class="text-center text-medium-emphasis py-8">
              Пользователи не найдены
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog v-model="blockDialogOpen" max-width="360">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2">
          {{ blockTarget?.isBlocked ? "Разблокировать" : "Заблокировать" }}
        </v-card-title>
        <v-card-text class="pa-4 pt-2 text-body-2 text-medium-emphasis">
          <template v-if="blockTarget?.isBlocked">
            Пользователь «{{ blockTarget?.email }}» снова получит доступ к платформе.
          </template>
          <template v-else>
            Пользователь «{{ blockTarget?.email }}» потеряет доступ к платформе.
          </template>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="blockDialogOpen = false">Отмена</v-btn>
          <v-btn
            :color="blockTarget?.isBlocked ? 'success' : 'error'"
            class="gv-cta"
            rounded="lg"
            :loading="isActing"
            @click="confirmBlock"
          >
            {{ blockTarget?.isBlocked ? "Разблокировать" : "Заблокировать" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.admin-users-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  background: #f5f5f5;
  white-space: nowrap;
}

.admin-users-table :deep(td) {
  font-size: 13px;
  vertical-align: middle;
}
</style>
