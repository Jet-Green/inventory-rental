<script setup lang="ts">
import dayjs from "dayjs";
import type { ICategory, ICatalogFilters } from "~/types/rental";

const props = withDefaults(
  defineProps<{
    categories: ICategory[];
    modelValue: ICatalogFilters;
    loading?: boolean;
    /** Кнопка «Применить» внутри панели (на главной — в диалоге). */
    showApplyButton?: boolean;
  }>(),
  { showApplyButton: true },
);

const emit = defineEmits<{
  "update:modelValue": [value: ICatalogFilters];
  apply: [];
}>();

const dateFromMenu = ref(false);
const dateToMenu = ref(false);

function updateField<K extends keyof ICatalogFilters>(
  key: K,
  value: ICatalogFilters[K],
): void {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

function toggleSort(value: NonNullable<ICatalogFilters["sortBy"]>): void {
  if (props.modelValue.sortBy === value) {
    updateField("sortBy", undefined);
    return;
  }
  updateField("sortBy", value);
}

function normalizePickerDate(value: unknown): string {
  if (!value) return "";
  const parsed = dayjs(String(value));
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DD");
}

function formatDateRu(dateIso?: string): string {
  if (!dateIso) return "";
  const parsed = dayjs(dateIso);
  if (!parsed.isValid()) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed.toDate());
}
</script>

<template>
  <div>
    <div class="gv-filters d-flex flex-wrap ga-3 align-center">
      <v-menu v-model="dateFromMenu" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-text-field v-bind="menuProps" :model-value="formatDateRu(modelValue.dateFrom)" label="Дата аренды · с"
            density="comfortable" variant="outlined" hide-details class="gv-filters__field" rounded="lg" readonly
            clearable prepend-inner-icon="mdi-calendar-month-outline"
            @click:clear="updateField('dateFrom', undefined)" />
        </template>
        <v-card>
          <v-date-picker :model-value="modelValue.dateFrom || undefined" color="primary" show-adjacent-months
            @update:model-value="updateField('dateFrom', normalizePickerDate($event) || undefined)" />
        </v-card>
      </v-menu>
      <v-menu v-model="dateToMenu" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-text-field v-bind="menuProps" :model-value="formatDateRu(modelValue.dateTo)" label="по"
            density="comfortable" variant="outlined" hide-details class="gv-filters__field" rounded="lg" readonly
            clearable prepend-inner-icon="mdi-calendar-month-outline" @click:clear="updateField('dateTo', undefined)" />
        </template>
        <v-card>
          <v-date-picker :model-value="modelValue.dateTo || undefined" :min="modelValue.dateFrom || undefined"
            color="primary" show-adjacent-months
            @update:model-value="updateField('dateTo', normalizePickerDate($event) || undefined)" />
        </v-card>
      </v-menu>
      <v-select :model-value="modelValue.pickupType ?? null" :items="[
        { title: 'Самовывоз', value: 'pickup' },
        { title: 'Доставка', value: 'delivery' },
        { title: 'Оба варианта', value: 'both' },
      ]" item-title="title" item-value="value" label="Способ получения" density="comfortable" variant="outlined"
        hide-details clearable class="gv-filters__field gv-filters__field--wide" rounded="lg"
        @update:model-value="updateField('pickupType', $event as ICatalogFilters['pickupType'])" />
      <v-select :model-value="modelValue.categories || []" :items="categories" item-title="name" item-value="key"
        label="Категории" density="comfortable" variant="outlined" hide-details multiple chips closable-chips
        class="gv-filters__field gv-filters__field--grow" rounded="lg"
        @update:model-value="updateField('categories', ($event as string[])?.length ? $event : undefined)" />
      <v-btn v-if="showApplyButton" color="primary" class="gv-cta" rounded="lg" height="48" :loading="loading"
        @click="emit('apply')">
        Применить
      </v-btn>
    </div>

    <div class="gv-filters__sort d-flex align-center ga-2 mt-3">
      <v-btn size="default" rounded="pill" :variant="modelValue.sortBy === 'priceAsc' ? 'flat' : 'outlined'"
        :color="modelValue.sortBy === 'priceAsc' ? 'primary' : undefined" @click="toggleSort('priceAsc')">
        Сначала дешевле
      </v-btn>
      <v-btn size="default" rounded="pill" :variant="modelValue.sortBy === 'priceDesc' ? 'flat' : 'outlined'"
        :color="modelValue.sortBy === 'priceDesc' ? 'primary' : undefined" @click="toggleSort('priceDesc')">
        Сначала дороже
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.gv-filters__field {
  width: 200px;
  max-width: 100%;
}

.gv-filters__field--wide {
  width: 220px;
}

.gv-filters__field--grow {
  flex: 1 1 280px;
  min-width: 200px;
}
</style>
