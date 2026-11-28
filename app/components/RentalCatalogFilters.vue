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

function updateDateFrom(value: string | undefined): void {
  // A new start must not leave a return date before it.
  emit("update:modelValue", {
    ...props.modelValue,
    dateFrom: value,
    dateTo: value && props.modelValue.dateTo && props.modelValue.dateTo <= value
      ? undefined : props.modelValue.dateTo,
  });
}

const minimumReturnDate = computed(() => props.modelValue.dateFrom
  ? dayjs(props.modelValue.dateFrom).add(1, "day").format("YYYY-MM-DD") : undefined);

const periodHint = computed(() => {
  const { dateFrom, dateTo } = props.modelValue;
  const format = (value: string) => value.split("-").reverse().join(".");
  if (dateFrom && dateTo) return `Выбран период: ${format(dateFrom)} — ${format(dateTo)}. Примените фильтры, чтобы обновить каталог.`;
  if (dateFrom) return `Получение: ${format(dateFrom)}. Теперь выберите дату возврата.`;
  if (dateTo) return `Возврат: ${format(dateTo)}. Выберите дату получения.`;
  return "";
});
</script>

<template>
  <div>
    <div class="gv-filters d-flex flex-wrap ga-3 align-center">
      <RentalDateFilterField v-model:open="dateFromMenu" :model-value="modelValue.dateFrom"
        label="Дата получения" empty-hint="Когда вы заберёте инвентарь" next-label="К дате возврата" class="gv-filters__field"
        @update:model-value="updateDateFrom" @next="dateToMenu = true" />
      <RentalDateFilterField v-model:open="dateToMenu" :model-value="modelValue.dateTo"
        :min="minimumReturnDate" label="Дата возврата" empty-hint="Когда вы вернёте инвентарь"
        :context="modelValue.dateFrom ? `Получение ${modelValue.dateFrom.split('-').reverse().join('.')}` : undefined" next-label="Готово"
        class="gv-filters__field" @update:model-value="updateField('dateTo', $event)" />
      <v-select :model-value="modelValue.pickupType ?? null" :items="[
        { title: 'Самовывоз', value: 'pickup' },
        { title: 'Доставка', value: 'delivery' },
        { title: 'Оба варианта', value: 'both' },
      ]" item-title="title" item-value="value" label="Способ получения" density="comfortable" variant="outlined"
        hide-details clearable class="gv-filters__field gv-filters__field--wide"
        @update:model-value="updateField('pickupType', $event as ICatalogFilters['pickupType'])" />
      <v-text-field :model-value="modelValue.unitsNeeded ?? null" label="Нужно единиц" type="number" :min="1"
        density="comfortable" variant="outlined" hide-details clearable class="gv-filters__field"
        @update:model-value="updateField('unitsNeeded', $event ? Number($event) : undefined)" />
      <v-select :model-value="modelValue.categories || []" :items="categories" item-title="name" item-value="key"
        label="Категории" density="comfortable" variant="outlined" hide-details multiple chips closable-chips
        class="gv-filters__field gv-filters__field--grow"
        @update:model-value="updateField('categories', ($event as string[])?.length ? $event : undefined)" />
      <v-btn v-if="showApplyButton" color="primary" class="gv-cta" height="48" :loading="loading"
        @click="emit('apply')">
        Применить
      </v-btn>
    </div>

    <p v-if="periodHint" class="gv-filters__period mt-3" role="status">{{ periodHint }}</p>

    <div class="gv-filters__sort d-flex flex-wrap align-center ga-2 mt-3">
      <v-btn size="default" class="action-btn" :variant="modelValue.sortBy === 'priceAsc' ? 'flat' : 'outlined'"
        :color="modelValue.sortBy === 'priceAsc' ? 'primary' : undefined" @click="toggleSort('priceAsc')">
        Сначала дешевле
      </v-btn>
      <v-btn size="default" class="action-btn" :variant="modelValue.sortBy === 'priceDesc' ? 'flat' : 'outlined'"
        :color="modelValue.sortBy === 'priceDesc' ? 'primary' : undefined" @click="toggleSort('priceDesc')">
        Сначала дороже
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.gv-filters__period { font-size: 14px; color: var(--gv-text-secondary); }
.gv-filters__field {
  flex: 1 1 160px;
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
@media(max-width:599px) { .gv-filters__field { flex-basis: 100%; width: 100%; } .gv-filters__sort .v-btn { font-size: 12px; flex: 1; } }
</style>
