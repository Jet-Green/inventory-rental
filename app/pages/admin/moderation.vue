<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { useAdminDashboard } from "~/composables/useAdminDashboard";
import { mongoIdTail } from "~/utils/mongoId";

const { listings, isLoading, fetchAdminData, moderate } = useAdminDashboard();

onMounted(() => {
  void fetchAdminData();
});

const filter = ref<"all" | "pending" | "active">("pending");

const rows = computed(() => {
  const list = listings.value || [];
  if (filter.value === "pending") {
    return list.filter((l) => l.moderationStatus === "pending");
  }
  if (filter.value === "active") {
    return list.filter((l) => l.moderationStatus === "active");
  }
  return list;
});
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-4">Модерация объявлений</h1>

    <div class="d-flex align-center ga-2 flex-wrap mb-4">
      <span class="text-caption text-medium-emphasis">Статус:</span>
      <v-chip
        :variant="filter === 'all' ? 'flat' : 'outlined'"
        :color="filter === 'all' ? 'primary' : 'default'"
        size="small"
        @click="filter = 'all'"
      >
        Все
      </v-chip>
      <v-chip
        :variant="filter === 'pending' ? 'flat' : 'outlined'"
        :color="filter === 'pending' ? 'primary' : 'default'"
        size="small"
        @click="filter = 'pending'"
      >
        На модерации
      </v-chip>
      <v-chip
        :variant="filter === 'active' ? 'flat' : 'outlined'"
        :color="filter === 'active' ? 'primary' : 'default'"
        size="small"
        @click="filter = 'active'"
      >
        Одобрено
      </v-chip>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="border rounded-lg overflow-hidden">
      <div
        class="d-flex ga-4 px-4 py-3 bg-grey-lighten-4 text-caption font-weight-semibold text-medium-emphasis flex-wrap"
      >
        <span class="flex-grow-1" style="min-width: 120px">Объявление</span>
        <span style="min-width: 80px">Автор</span>
        <span style="min-width: 70px">Категория</span>
        <span style="min-width: 90px">Статус</span>
        <span style="min-width: 220px">Действия</span>
      </div>
      <div
        v-for="item in rows"
        :key="item._id"
        class="d-flex ga-4 px-4 py-3 border-t flex-wrap align-center"
      >
        <span class="text-caption flex-grow-1" style="min-width: 120px">{{ item.title }}</span>
        <span class="text-caption text-medium-emphasis" style="min-width: 80px">
          {{ mongoIdTail(item.ownerId) }}
        </span>
        <span class="text-caption text-medium-emphasis" style="min-width: 70px">
          {{ item.categories?.[0]?.name || "—" }}
        </span>
        <span class="text-caption text-primary font-weight-semibold" style="min-width: 90px">
          {{ item.moderationStatus === "pending" ? "На модерации" : item.moderationStatus }}
        </span>
        <div class="d-flex ga-2 flex-wrap" style="min-width: 220px">
          <v-btn
            size="small"
            color="primary"
            class="gv-cta"
            :to="`/rental-item/${item._id}`"
            target="_blank"
          >
            Смотр.
          </v-btn>
          <v-btn size="small" color="primary" class="gv-cta" @click="moderate(item._id, 'active')">
            Ок
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            class="gv-cta"
            @click="moderate(item._id, 'rejected')"
          >
            Откл.
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            class="gv-cta"
            @click="moderate(item._id, 'hidden')"
          >
            Скр.
          </v-btn>
        </div>
      </div>
      <p v-if="!rows.length" class="pa-4 text-caption text-medium-emphasis">Нет объявлений</p>
    </div>
  </div>
</template>
