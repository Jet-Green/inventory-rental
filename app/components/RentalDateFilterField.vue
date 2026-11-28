<script setup lang="ts">
import dayjs from "dayjs";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: string;
  label: string;
  min?: string;
  nextLabel: string;
  emptyHint: string;
  context?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string | undefined];
  next: [];
}>();
const isOpen = defineModel<boolean>("open", { default: false });
const displayDate = computed(() => props.modelValue ? dayjs(props.modelValue).format("DD.MM.YYYY") : "");

function selectDate(value: unknown): void {
  const date = dayjs(value as string | Date);
  emit("update:modelValue", value && date.isValid() ? date.format("YYYY-MM-DD") : undefined);
}

function next(): void {
  isOpen.value = false;
  emit("next");
}
</script>

<template>
  <div v-bind="$attrs">
    <v-menu v-model="isOpen" :close-on-content-click="false" :max-width="'calc(100vw - 16px)'">
      <template #activator="{ props: menuProps }">
        <v-text-field v-bind="menuProps" :model-value="displayDate" :label="label"
          placeholder="ДД.ММ.ГГГГ" persistent-placeholder density="comfortable" variant="outlined"
          hide-details readonly clearable prepend-inner-icon="mdi-calendar-month-outline"
          @click:clear="emit('update:modelValue', undefined)"
          @keydown.enter.stop.prevent="isOpen = true" @keydown.space.stop.prevent="isOpen = true" />
      </template>
      <v-card class="gv-modal rental-date-filter">
        <v-date-picker :model-value="modelValue || undefined" :min="min" color="primary"
          width="100%" show-adjacent-months @update:model-value="selectDate">
          <template #title><h2 class="rental-date-filter__title">{{ label }}</h2></template>
          <template #header>
            <p class="rental-date-filter__selection" aria-live="polite">
              {{ displayDate || emptyHint }}
            </p>
            <p v-if="context" class="rental-date-filter__context">{{ context }}</p>
          </template>
          <template #actions>
            <v-btn color="primary" variant="flat" :disabled="!modelValue" @click="next">{{ nextLabel }}</v-btn>
          </template>
        </v-date-picker>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.rental-date-filter { width: 328px; max-width: calc(100vw - 16px); }
.rental-date-filter__title { font-size: 18px; font-weight: 600; text-transform: none; letter-spacing: normal; }
.rental-date-filter__context { padding: 0 24px 16px; font-size: 14px; }
.rental-date-filter__selection { padding: 0 24px 16px; font-size: 16px; }
.rental-date-filter :deep(.v-date-picker-month) { padding-inline: 4px; min-width: 0; }
</style>
