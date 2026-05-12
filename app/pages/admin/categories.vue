<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import CategoryApi from "~/api/CategoryApi";
import type { ICategory } from "~/types/rental";

const categories = ref<ICategory[]>([]);

onMounted(async () => {
  const res = await CategoryApi.getVisible();
  categories.value = res.categories || [];
});

const demoRows = [
  { name: "Спорт", icon: "🚴", on: "Вкл", order: 10 },
  { name: "Детям", icon: "🧸", on: "Вкл", order: 20 },
  { name: "Для ОВЗ", icon: "♿", on: "Вкл", order: 30 },
];
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-4">Категории</h1>
    <v-btn color="primary" class="gv-cta mb-4" rounded="lg" disabled>Создать категорию</v-btn>

    <div class="border rounded-lg overflow-hidden">
      <div class="d-flex ga-6 px-4 py-3 bg-grey-lighten-4 text-caption font-weight-semibold text-medium-emphasis">
        <span style="min-width: 100px">Название</span>
        <span style="min-width: 60px">Иконка</span>
        <span style="min-width: 60px">Статус</span>
        <span style="min-width: 50px">Порядок</span>
        <span>Действия</span>
      </div>
      <div
        v-for="(row, idx) in demoRows"
        :key="row.name"
        class="d-flex ga-6 px-4 py-3 border-t align-center flex-wrap"
      >
        <span class="text-caption" style="min-width: 100px">{{ row.name }}</span>
        <span class="text-caption" style="min-width: 60px">{{ row.icon }}</span>
        <span class="text-caption" style="min-width: 60px">{{ row.on }}</span>
        <span class="text-caption" style="min-width: 50px">{{ row.order }}</span>
        <div class="d-flex ga-2">
          <v-btn size="small" variant="outlined" color="primary" class="gv-cta">Изм.</v-btn>
          <v-btn size="small" variant="outlined" color="primary" class="gv-cta">Скр.</v-btn>
          <v-btn size="small" variant="outlined" color="primary" class="gv-cta">Удал.</v-btn>
        </div>
      </div>
      <div
        v-for="c in categories"
        :key="c._id"
        class="d-flex ga-6 px-4 py-3 border-t align-center flex-wrap text-caption"
      >
        <span style="min-width: 100px">{{ c.name }} (API)</span>
        <span style="min-width: 60px">—</span>
        <span style="min-width: 60px">{{ c.isVisible ? "Вкл" : "Выкл" }}</span>
        <span style="min-width: 50px">—</span>
        <span class="text-medium-emphasis">данные из каталога</span>
      </div>
    </div>
  </div>
</template>
