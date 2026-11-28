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
const dropzoneRef = ref<HTMLElement | null>(null);
const isDragOver = ref(false);
const selectionMessage = ref("");
const hintId = useId();
const messageId = useId();

const remaining = computed(() => Math.max(0, props.max - props.modelValue.length));
const isFull = computed(() => remaining.value <= 0);

function openPicker(): void {
  if (props.uploading || isFull.value) return;
  inputRef.value?.click();
}

function emitFiles(fileList: FileList | null): void {
  if (!fileList || !fileList.length) return;
  if (props.uploading || isFull.value) return;
  const selected = Array.from(fileList);
  selectionMessage.value = selected.length > remaining.value
    ? `Можно добавить ещё ${remaining.value} фото. Остальные файлы не добавлены.`
    : "";
  const files = selected.slice(0, remaining.value);
  if (files.length) emit("files", files);
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
  if (props.uploading) return;
  selectionMessage.value = `Фото ${index + 1} удалено из объявления.`;
  const next = props.modelValue.slice();
  next.splice(index, 1);
  emit("update:modelValue", next);
  void nextTick(() => dropzoneRef.value?.focus());
}
</script>

<template>
  <div>
    <div
      ref="dropzoneRef"
      class="dropzone"
      :class="{ 'dropzone--over': isDragOver, 'dropzone--disabled': isFull || uploading }"
      role="button"
      tabindex="0"
      :aria-disabled="isFull || uploading"
      aria-label="Выбрать фотографии"
      :aria-describedby="`${hintId} ${messageId}`"
      :aria-busy="uploading"
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
      <p v-if="uploading" class="dropzone__title mt-2 mb-1" role="status">
        Загружаем фотографии… Дождитесь завершения.
      </p>
      <template v-else>
        <v-icon icon="mdi-cloud-upload-outline" size="32" color="primary" />
        <p class="dropzone__title mt-2 mb-1">
          {{ isFull ? "Достигнут лимит фото" : "Выберите фото или перетащите сюда" }}
        </p>
      </template>
      <p :id="hintId" class="dropzone__hint mb-0">
        JPG, PNG, WEBP, GIF · до 8 МБ на файл<br />
        Загружено {{ modelValue.length }} из {{ max }}
      </p>
      <input
        ref="inputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="d-none"
        @click.stop
        @change="onInputChange"
      />
    </div>

    <p :id="messageId" role="status" class="dropzone__hint mt-2 mb-0">{{ selectionMessage }}</p>

    <div v-if="modelValue.length" class="dropzone__grid mt-3">
      <div v-for="(url, index) in modelValue" :key="url + index" class="dropzone__thumb">
        <img :src="url" :alt="`Фото ${index + 1}`" />
        <button
          type="button"
          class="dropzone__remove"
          :aria-label="`Удалить фото ${index + 1}${index === 0 ? ' (обложка)' : ''}`"
          :disabled="uploading"
          @click.stop="removeAt(index)"
        >
          <v-icon icon="mdi-close" size="16" />
        </button>
        <span v-if="index === 0" class="dropzone__cover">Обложка</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed var(--gv-border);
  border-radius: var(--gv-radius-card);
  padding: 32px;
  background: var(--gv-bg-page);
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
  grid-template-columns: repeat(auto-fit, 80px);
  gap: 8px;
}

.dropzone__thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--gv-radius-thumb);
  overflow: hidden;
  background: var(--gv-border-light);
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
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(32, 28, 23, 0.6);
  color: var(--gv-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}
.dropzone:focus-visible,
.dropzone__remove:focus-visible {
  outline: 3px solid var(--gv-primary);
  outline-offset: 3px;
}
.dropzone__remove:disabled {
  cursor: wait;
}
.dropzone__cover {
  position: absolute;
  bottom: 0;
  inset-inline: 0;
  padding: 2px;
  background: rgba(32, 28, 23, 0.75);
  color: white;
  font-size: 11px;
  text-align: center;
}
</style>
