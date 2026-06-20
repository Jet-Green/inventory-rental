<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Список загруженных URL фото. */
    modelValue: string[];
    max?: number;
    uploading?: boolean;
  }>(),
  { max: 5, uploading: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  /** Выбранные пользователем файлы для загрузки на сервер. */
  files: [files: File[]];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const remaining = computed(() => Math.max(0, props.max - props.modelValue.length));
const isFull = computed(() => remaining.value <= 0);

function openPicker(): void {
  if (props.uploading || isFull.value) return;
  inputRef.value?.click();
}

function emitFiles(fileList: FileList | null): void {
  if (!fileList || !fileList.length) return;
  const files = Array.from(fileList).slice(0, remaining.value);
  if (!files.length) return;
  emit("files", files);
}

function onInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  emitFiles(target.files);
  // сбрасываем, чтобы повторный выбор того же файла снова срабатывал
  target.value = "";
}

function onDrop(event: DragEvent): void {
  isDragOver.value = false;
  if (props.uploading || isFull.value) return;
  emitFiles(event.dataTransfer?.files ?? null);
}

function onDragOver(): void {
  if (props.uploading || isFull.value) return;
  isDragOver.value = true;
}

function removeAt(index: number): void {
  const next = props.modelValue.slice();
  next.splice(index, 1);
  emit("update:modelValue", next);
}
</script>

<template>
  <div>
    <div
      class="dropzone"
      :class="{ 'dropzone--over': isDragOver, 'dropzone--disabled': isFull || uploading }"
      role="button"
      tabindex="0"
      :aria-disabled="isFull || uploading"
      aria-label="Загрузить фото"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <v-progress-circular
        v-if="uploading"
        indeterminate
        color="primary"
        size="28"
      />
      <template v-else>
        <v-icon icon="mdi-cloud-upload-outline" size="32" color="primary" />
        <p class="dropzone__title mt-2 mb-1">
          {{ isFull ? "Достигнут лимит фото" : "Перетащите фото или нажмите" }}
        </p>
        <p class="dropzone__hint mb-0">JPG, PNG, WEBP до 8 МБ · {{ modelValue.length }}/{{ max }}</p>
      </template>
      <input
        ref="inputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="d-none"
        @change="onInputChange"
      />
    </div>

    <div v-if="modelValue.length" class="dropzone__grid mt-3">
      <div v-for="(url, index) in modelValue" :key="url + index" class="dropzone__thumb">
        <img :src="url" :alt="`Фото ${index + 1}`" />
        <button
          type="button"
          class="dropzone__remove"
          aria-label="Удалить фото"
          @click.stop="removeAt(index)"
        >
          <v-icon icon="mdi-close" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed var(--gv-border);
  border-radius: 12px;
  padding: 32px;
  background: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.dropzone:hover,
.dropzone--over {
  border-color: var(--gv-primary);
  background: var(--gv-primary-soft-bg);
}

.dropzone--disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.dropzone__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--gv-text);
}

.dropzone__hint {
  font-size: 12px;
  color: var(--gv-text-muted);
}

.dropzone__grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  gap: 8px;
}

.dropzone__thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #eee;
}

.dropzone__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dropzone__remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}
</style>
