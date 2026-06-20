<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

import { toast } from "vue3-toastify";
import { useAdminCategories } from "~/composables/useAdminCategories";
import type { ICategoryFull } from "~/types/rental";

const {
  categories,
  isLoading,
  fetchCategories,
  createCategory,
  updateCategory,
  toggleVisibility,
  removeCategory,
} = useAdminCategories();

const dialogOpen = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  key: "",
  name: "",
  icon: "",
  order: 0,
});

const deleteDialogOpen = ref(false);
const deleteTarget = ref<ICategoryFull | null>(null);

onMounted(() => {
  void fetchCategories();
});

function openCreate(): void {
  editingId.value = null;
  form.key = "";
  form.name = "";
  form.icon = "";
  form.order = 0;
  dialogOpen.value = true;
}

function openEdit(category: ICategoryFull): void {
  editingId.value = category._id;
  form.key = category.key;
  form.name = category.name;
  form.icon = category.icon || "";
  form.order = category.order ?? 0;
  dialogOpen.value = true;
}

async function save(): Promise<void> {
  if (!form.name.trim() || (!editingId.value && !form.key.trim())) {
    toast("Заполните название и ключ категории.", { type: "warning" });
    return;
  }
  try {
    isSaving.value = true;
    if (editingId.value) {
      await updateCategory(editingId.value, {
        name: form.name.trim(),
        icon: form.icon.trim() || undefined,
        order: Number(form.order) || 0,
      });
      toast("Категория обновлена.", { type: "success", autoClose: 4000 });
    } else {
      await createCategory({
        key: form.key.trim(),
        name: form.name.trim(),
        icon: form.icon.trim() || undefined,
        order: Number(form.order) || 0,
      });
      toast("Категория создана.", { type: "success", autoClose: 4000 });
    }
    dialogOpen.value = false;
  } finally {
    isSaving.value = false;
  }
}

async function onToggleVisibility(category: ICategoryFull): Promise<void> {
  await toggleVisibility(category._id, !category.isVisible);
  toast(
    category.isVisible ? "Категория скрыта." : "Категория показана.",
    { type: "info", autoClose: 4000 },
  );
}

function openDelete(category: ICategoryFull): void {
  deleteTarget.value = category;
  deleteDialogOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) return;
  await removeCategory(deleteTarget.value._id);
  deleteDialogOpen.value = false;
  toast("Категория удалена.", { type: "info", autoClose: 4000 });
}
</script>

<template>
  <div class="px-5 py-6">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <h1 class="gv-display text-h4">Категории</h1>
      <v-btn color="primary" class="gv-cta" rounded="lg" @click="openCreate">
        Создать категорию
      </v-btn>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4" />

    <div class="gv-card-elevated overflow-hidden rounded-lg admin-cat-table">
      <v-table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Иконка</th>
            <th>Статус</th>
            <th>Порядок</th>
            <th class="text-end">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in categories" :key="c._id">
            <td class="font-weight-medium">{{ c.name }}</td>
            <td>{{ c.icon || "—" }}</td>
            <td>
              <v-chip
                size="small"
                variant="tonal"
                :color="c.isVisible ? 'success' : undefined"
              >
                {{ c.isVisible ? "Вкл" : "Выкл" }}
              </v-chip>
            </td>
            <td>{{ c.order ?? 0 }}</td>
            <td class="text-end">
              <div class="d-flex ga-2 justify-end flex-wrap">
                <v-btn size="small" variant="outlined" color="primary" class="gv-cta" @click="openEdit(c)">
                  Изм.
                </v-btn>
                <v-btn size="small" variant="outlined" color="primary" class="gv-cta" @click="onToggleVisibility(c)">
                  {{ c.isVisible ? "Скр." : "Пок." }}
                </v-btn>
                <v-btn size="small" variant="outlined" color="error" class="gv-cta" @click="openDelete(c)">
                  Удал.
                </v-btn>
              </div>
            </td>
          </tr>
          <tr v-if="!isLoading && !categories.length">
            <td colspan="5" class="text-center text-medium-emphasis py-8">
              Категорий пока нет
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog v-model="dialogOpen" max-width="440">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2">
          {{ editingId ? "Редактировать категорию" : "Новая категория" }}
        </v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-if="!editingId"
            v-model="form.key"
            label="Ключ (латиницей, напр. sport)"
            variant="outlined"
            rounded="lg"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="form.name"
            label="Название"
            variant="outlined"
            rounded="lg"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model="form.icon"
            label="Иконка (emoji)"
            variant="outlined"
            rounded="lg"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-model.number="form.order"
            label="Порядок"
            type="number"
            variant="outlined"
            rounded="lg"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="dialogOpen = false">Отмена</v-btn>
          <v-btn color="primary" class="gv-cta" rounded="lg" :loading="isSaving" @click="save">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2">Удалить категорию</v-card-title>
        <v-card-text class="pa-4 pt-2 text-body-2 text-medium-emphasis">
          Категория «{{ deleteTarget?.name }}» будет удалена.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="deleteDialogOpen = false">Отмена</v-btn>
          <v-btn color="error" class="gv-cta" rounded="lg" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.admin-cat-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  background: #f5f5f5;
  white-space: nowrap;
}

.admin-cat-table :deep(td) {
  font-size: 13px;
  vertical-align: middle;
}
</style>
