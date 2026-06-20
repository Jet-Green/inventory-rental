<script setup lang="ts">
import { useDadata } from "~/composables/useDadata";
import type { IDadataCompany } from "~/types/rental";

const props = withDefaults(
  defineProps<{
    /** Значение ИНН (v-model). */
    modelValue: string;
    label?: string;
  }>(),
  { label: "ИНН" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** Пользователь нажал «Использовать» — родитель заполняет поля. */
  apply: [company: IDadataCompany];
}>();

const { isLoading, company, error, isValidInn, lookup, reset } = useDadata();

function onInput(value: string): void {
  emit("update:modelValue", value);
  if (company.value || error.value) reset();
}

async function onBlur(): Promise<void> {
  const inn = props.modelValue?.trim();
  if (!inn || !isValidInn(inn)) return;
  await lookup(inn);
}

function applyCompany(): void {
  if (company.value) emit("apply", company.value);
}
</script>

<template>
  <div>
    <v-text-field
      :model-value="modelValue"
      :label="label"
      variant="outlined"
      rounded="lg"
      :loading="isLoading"
      inputmode="numeric"
      @update:model-value="onInput"
      @blur="onBlur"
    >
      <template #append-inner>
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          size="16"
          width="2"
        />
      </template>
    </v-text-field>

    <v-alert
      v-if="error"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-3 dadata__alert"
    >
      {{ error }}
    </v-alert>

    <div v-if="company" class="dadata__result rounded-lg pa-4 mb-3">
      <p class="font-weight-semibold mb-1">
        Найдено: {{ company.shortName || company.name }}
      </p>
      <p class="text-caption text-medium-emphasis mb-1">ОГРН: {{ company.ogrn }}</p>
      <p class="text-caption text-medium-emphasis mb-3">{{ company.address }}</p>
      <v-btn
        variant="outlined"
        color="primary"
        class="gv-cta"
        rounded="lg"
        size="small"
        @click="applyCompany"
      >
        Использовать
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.dadata__alert {
  font-size: 13px;
}

.dadata__result {
  background: #f0f7e0;
  border: 1px solid #d4e09a;
}
</style>
