<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { toast } from "vue3-toastify";
import { useAdminModeration } from "~/composables/useAdminModeration";
import { mongoIdTail } from "~/utils/mongoId";
import type { ListingStatus } from "~/types/rental";

const { listings, isLoading, fetchListings, approve, reject, hide, remove } =
  useAdminModeration();

const filter = ref<ListingStatus | "all">("pending");

const rejectDialogOpen = ref(false);
const rejectTargetId = ref("");
const rejectReason = ref("");
const isActing = ref(false);

const deleteDialogOpen = ref(false);
const deleteTargetId = ref("");

const STATUS_FILTERS: Array<{ value: ListingStatus | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "pending", label: "На модерации" },
  { value: "active", label: "Одобрено" },
  { value: "rejected", label: "Отклонено" },
  { value: "hidden", label: "Скрыто" },
];

onMounted(() => {
  void fetchListings();
});

const rows = computed(() => {
  const list = listings.value || [];
  if (filter.value === "all") return list;
  return list.filter((l) => l.moderationStatus === filter.value);
});

function ownerTail(ownerId: unknown): string {
  if (ownerId && typeof ownerId === "object") {
    const o = ownerId as { fullName?: string; _id?: string };
    return o.fullName || mongoIdTail(o._id || "");
  }
  return mongoIdTail(String(ownerId || ""));
}

async function onApprove(id: string): Promise<void> {
  isActing.value = true;
  try {
    await approve(id);
    toast("Объявление одобрено.", { type: "success", autoClose: 4000 });
  } finally {
    isActing.value = false;
  }
}

async function onHide(id: string): Promise<void> {
  isActing.value = true;
  try {
    await hide(id);
    toast("Объявление скрыто.", { type: "info", autoClose: 4000 });
  } finally {
    isActing.value = false;
  }
}

function openReject(id: string): void {
  rejectTargetId.value = id;
  rejectReason.value = "";
  rejectDialogOpen.value = true;
}

async function confirmReject(): Promise<void> {
  if (!rejectTargetId.value) return;
  isActing.value = true;
  try {
    await reject(rejectTargetId.value, rejectReason.value.trim() || undefined);
    rejectDialogOpen.value = false;
    toast("Объявление отклонено.", { type: "info", autoClose: 4000 });
  } finally {
    isActing.value = false;
  }
}

function openDelete(id: string): void {
  deleteTargetId.value = id;
  deleteDialogOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (!deleteTargetId.value) return;
  isActing.value = true;
  try {
    await remove(deleteTargetId.value);
    deleteDialogOpen.value = false;
    toast("Объявление удалено.", { type: "info", autoClose: 4000 });
  } finally {
    isActing.value = false;
  }
}
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-4">Модерация объявлений</h1>

    <v-chip-group v-model="filter" mandatory class="mb-4">
      <v-chip
        v-for="opt in STATUS_FILTERS"
        :key="opt.value"
        :value="opt.value"
        size="small"
        :variant="filter === opt.value ? 'flat' : 'outlined'"
        :color="filter === opt.value ? 'primary' : undefined"
      >
        {{ opt.label }}
      </v-chip>
    </v-chip-group>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="gv-card-elevated overflow-hidden rounded-lg admin-mod-table">
      <v-table>
        <thead>
          <tr>
            <th>Объявление</th>
            <th>Автор</th>
            <th>Категория</th>
            <th>Статус</th>
            <th class="text-end">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item._id">
            <td class="font-weight-medium">{{ item.title }}</td>
            <td class="text-caption text-medium-emphasis">{{ ownerTail(item.ownerId) }}</td>
            <td class="text-caption text-medium-emphasis">
              {{ item.categories?.[0]?.name || "—" }}
            </td>
            <td><StatusChip :status="item.moderationStatus" type="listing" /></td>
            <td class="text-end">
              <div class="d-flex ga-2 justify-end flex-wrap">
                <v-btn
                  size="small"
                  color="primary"
                  class="gv-cta"
                  :to="`/rental-item/${item._id}`"
                  target="_blank"
                >
                  Смотр.
                </v-btn>
                <v-btn
                  v-if="item.moderationStatus !== 'active'"
                  size="small"
                  color="primary"
                  class="gv-cta"
                  :disabled="isActing"
                  @click="onApprove(item._id)"
                >
                  Ок
                </v-btn>
                <v-btn
                  v-if="item.moderationStatus !== 'rejected'"
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="gv-cta"
                  :disabled="isActing"
                  @click="openReject(item._id)"
                >
                  Откл.
                </v-btn>
                <v-btn
                  v-if="item.moderationStatus !== 'hidden'"
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="gv-cta"
                  :disabled="isActing"
                  @click="onHide(item._id)"
                >
                  Скр.
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="error"
                  class="gv-cta"
                  :disabled="isActing"
                  @click="openDelete(item._id)"
                >
                  Удал.
                </v-btn>
              </div>
            </td>
          </tr>
          <tr v-if="!isLoading && !rows.length">
            <td colspan="5" class="text-center text-medium-emphasis py-8">Нет объявлений</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog v-model="rejectDialogOpen" max-width="440">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2">Отклонить объявление</v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-textarea
            v-model="rejectReason"
            label="Причина отклонения"
            variant="outlined"
            rounded="lg"
            rows="3"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="rejectDialogOpen = false">Отмена</v-btn>
          <v-btn color="error" class="gv-cta" rounded="lg" :loading="isActing" @click="confirmReject">
            Отклонить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2">Удалить объявление</v-card-title>
        <v-card-text class="pa-4 pt-2 text-body-2 text-medium-emphasis">
          Объявление будет удалено без возможности восстановления.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="deleteDialogOpen = false">Отмена</v-btn>
          <v-btn color="error" class="gv-cta" rounded="lg" :loading="isActing" @click="confirmDelete">
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.admin-mod-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  background: #f5f5f5;
  white-space: nowrap;
}

.admin-mod-table :deep(td) {
  font-size: 13px;
  vertical-align: middle;
}
</style>
