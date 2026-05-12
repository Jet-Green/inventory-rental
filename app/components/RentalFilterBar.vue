<script setup lang="ts">
import type { ICategory, ICatalogFilters } from "~/types/rental";

const props = defineProps<{
  categories: ICategory[];
  modelValue: ICatalogFilters;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ICatalogFilters];
  apply: [];
}>();

function updateField<K extends keyof ICatalogFilters>(
  key: K,
  value: ICatalogFilters[K],
): void {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}
</script>

<template>
  <div class="gv-filters d-flex flex-wrap ga-3 align-center">
    <v-text-field
      :model-value="modelValue.dateFrom"
      label="Даты аренды · с"
      type="date"
      density="comfortable"
      variant="outlined"
      hide-details
      class="gv-filters__field"
      rounded="lg"
      @update:model-value="updateField('dateFrom', String($event || ''))"
    />
    <v-text-field
      :model-value="modelValue.dateTo"
      label="по"
      type="date"
      density="comfortable"
      variant="outlined"
      hide-details
      class="gv-filters__field"
      rounded="lg"
      @update:model-value="updateField('dateTo', String($event || ''))"
    />
    <v-text-field
      :model-value="modelValue.priceFrom"
      label="Стоимость от"
      type="number"
      density="comfortable"
      variant="outlined"
      hide-details
      class="gv-filters__field"
      rounded="lg"
      @update:model-value="updateField('priceFrom', Number($event || 0) || undefined)"
    />
    <v-text-field
      :model-value="modelValue.priceTo"
      label="до"
      type="number"
      density="comfortable"
      variant="outlined"
      hide-details
      class="gv-filters__field"
      rounded="lg"
      @update:model-value="updateField('priceTo', Number($event || 0) || undefined)"
    />
    <v-select
      :model-value="modelValue.pickupType ?? null"
      :items="[
        { title: 'Самовывоз', value: 'pickup' },
        { title: 'Доставка', value: 'delivery' },
        { title: 'Оба варианта', value: 'both' },
      ]"
      item-title="title"
      item-value="value"
      label="Способ получения"
      density="comfortable"
      variant="outlined"
      hide-details
      clearable
      class="gv-filters__field gv-filters__field--wide"
      rounded="lg"
      @update:model-value="updateField('pickupType', $event as ICatalogFilters['pickupType'])"
    />
    <v-text-field
      :model-value="modelValue.unitsNeeded"
      label="Количество"
      type="number"
      min="1"
      density="comfortable"
      variant="outlined"
      hide-details
      class="gv-filters__field"
      rounded="lg"
      @update:model-value="updateField('unitsNeeded', Number($event || 0) || undefined)"
    />
    <v-select
      :model-value="modelValue.categories || []"
      :items="categories"
      item-title="name"
      item-value="key"
      label="Категории"
      density="comfortable"
      variant="outlined"
      hide-details
      multiple
      chips
      closable-chips
      class="gv-filters__field gv-filters__field--grow"
      rounded="lg"
      @update:model-value="updateField('categories', ($event as string[])?.length ? $event : undefined)"
    />
    <v-btn
      color="primary"
      class="gv-cta"
      rounded="lg"
      height="48"
      :loading="loading"
      @click="emit('apply')"
    >
      Применить
    </v-btn>
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
