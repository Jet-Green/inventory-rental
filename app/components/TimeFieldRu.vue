<script setup lang="ts">
/** Поле времени 24 ч: черновик в попапе, применение по кнопке «Готово». */
const props = withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const model = defineModel<string>({ required: true });

const menuOpen = ref(false);
const draftTime = ref("09:00");

function normalizeTime(value: string | null | undefined): string {
  if (!value) return "09:00";
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "09:00";
  const h = Math.min(23, Math.max(0, Number(match[1])));
  const m = Math.min(59, Math.max(0, Number(match[2])));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const displayTime = computed(() => normalizeTime(model.value));

type TimePickerValue =
  | string
  | { hours: number; minutes: number }
  | null
  | undefined;

function timeFromPicker(value: TimePickerValue): string | null {
  if (value == null) return null;
  if (typeof value === "object" && "hours" in value) {
    const h = String(value.hours).padStart(2, "0");
    const m = String(value.minutes).padStart(2, "0");
    return normalizeTime(`${h}:${m}`);
  }
  return normalizeTime(String(value));
}

function onDraftUpdate(value: TimePickerValue): void {
  const next = timeFromPicker(value);
  if (next) draftTime.value = next;
}

function applyTime(): void {
  model.value = normalizeTime(draftTime.value);
  menuOpen.value = false;
}

function cancelMenu(): void {
  menuOpen.value = false;
}

watch(menuOpen, (open) => {
  if (open) draftTime.value = displayTime.value;
});
</script>

<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    location="bottom"
    :disabled="disabled"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :model-value="displayTime"
        :label="label"
        variant="outlined"
        density="compact"
        hide-details
        readonly
        :disabled="disabled"
        prepend-inner-icon="mdi-clock-outline"
        class="time-field-ru"
      />
    </template>

    <v-card class="time-field-ru__panel" elevation="8" @click.stop>
      <v-time-picker
        :model-value="draftTime"
        format="24hr"
        color="primary"
        title="Выберите время"
        @update:model-value="onDraftUpdate"
      />
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn variant="text" size="small" @click="cancelMenu">Отмена</v-btn>
        <v-btn color="primary" variant="flat" size="small" @click="applyTime">
          Готово
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style scoped>
.time-field-ru :deep(input) {
  cursor: pointer;
}

.time-field-ru__panel {
  overflow: hidden;
}
</style>
