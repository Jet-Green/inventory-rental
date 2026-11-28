<script setup lang="ts">
import CategoryApi from "~/api/CategoryApi";
import RentalApi from "~/api/RentalApi";
import { useAuthProfile } from "~/composables/useAuthProfile";
import { useRole } from "~/composables/useRole";
import { useUpload } from "~/composables/useUpload";
import type { ICategory } from "~/types/rental";
import {
  createDefaultWeekSchedule,
  formatAvailabilityRange,
  scheduleToCalendarRanges,
  type IWeekdayAvailability,
} from "~/utils/listingAvailability";

const router = useRouter();
const { fetchProfile } = useAuthProfile();
const { fetchMine } = useMyOrganization();
const { isBusiness } = useRole();
const { uploadPhotos, isUploading } = useUpload();
const categories = ref<ICategory[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref("");
const step = ref(1);
const photoError = ref("");
const initialLoading = ref(true);
const loadError = ref(false);

const form = reactive({
  title: "",
  description: "",
  categories: [] as string[],
  photos: [] as string[],
  pricePerDay: 1000,
  minDays: 1,
  unitsTotal: 1,
  pickupType: "pickup" as "pickup" | "delivery" | "both",
  pickupAddress: "",
  deliveryZone: "",
});

const availabilitySchedule = ref<IWeekdayAvailability[]>(
  createDefaultWeekSchedule(),
);

const steps = [
  { n: 1, label: "Описание" },
  { n: 2, label: "Фото" },
  { n: 3, label: "Цена и количество" },
  { n: 4, label: "Получение" },
  { n: 5, label: "Доступность" },
  { n: 6, label: "Проверка" },
];

async function load(): Promise<void> {
  initialLoading.value = true;
  loadError.value = false;
  try {
    await Promise.all([fetchProfile(), fetchMine()]);
    const response = await CategoryApi.getVisible();
    categories.value = response.categories;
  } catch {
    loadError.value = true;
  } finally {
    initialLoading.value = false;
  }
}
onMounted(() => {
  void load();
});

function validateStep(n: number): string {
  if (
    n === 1 &&
    (!form.title.trim() ||
      form.title.length > 140 ||
      form.description.length > 3000)
  )
    return "Введите название до 140 символов и описание до 3000 символов.";
  if (
    n === 3 &&
    ![form.pricePerDay, form.minDays, form.unitsTotal].every(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 1,
    )
  )
    return "Цена, минимальный срок и количество должны быть не меньше 1.";
  if (n === 5 && !scheduleToCalendarRanges(availabilitySchedule.value).length)
    return "Выберите хотя бы один день доступности.";
  return "";
}
function goStep(target: number): void {
  if (isSubmitting.value || isUploading.value) return;
  errorMessage.value = "";
  for (let n = 1; n < target; n++) {
    const message = validateStep(n);
    if (message) {
      step.value = n;
      errorMessage.value = message;
      return;
    }
  }
  step.value = target;
}

async function submit(): Promise<void> {
  if (
    isSubmitting.value ||
    isUploading.value ||
    initialLoading.value ||
    loadError.value
  )
    return;
  errorMessage.value = "";
  for (let n = 1; n <= 5; n++) {
    const message = validateStep(n);
    if (message) {
      step.value = n;
      errorMessage.value = message;
      return;
    }
  }
  if (!isBusiness.value) {
    errorMessage.value =
      "Перед публикацией объявления дождитесь подтверждения организации.";
    return;
  }

  try {
    isSubmitting.value = true;
    const calendar = scheduleToCalendarRanges(availabilitySchedule.value);
    if (!calendar.length) {
      errorMessage.value =
        "Укажите хотя бы один день доступности на шаге «Доступность».";
      return;
    }

    await RentalApi.create({
      title: form.title,
      description: form.description,
      categories: form.categories,
      photos: form.photos.filter(Boolean),
      pricePerDay: Number(form.pricePerDay),
      minDays: form.minDays,
      unitsTotal: form.unitsTotal,
      pickupType: form.pickupType,
      pickupAddress: form.pickupAddress || undefined,
      deliveryZone: form.deliveryZone || undefined,
      calendar,
    });
    await router.push("/business-cabinet/listings");
  } catch {
    errorMessage.value =
      "Не удалось отправить объявление. Проверьте данные и попробуйте снова.";
  } finally {
    isSubmitting.value = false;
  }
}

function nextStep(): void {
  goStep(Math.min(6, step.value + 1));
}

function prevStep(): void {
  goStep(Math.max(1, step.value - 1));
}

/** Загружает выбранные файлы на сервер и добавляет полученные URL в форму. */
async function onPhotosSelected(files: File[]): Promise<void> {
  if (isUploading.value || isSubmitting.value) return;
  photoError.value = "";
  try {
    const urls = await uploadPhotos(files);
    if (urls.length) {
      form.photos = [...form.photos, ...urls].slice(0, 5);
    } else {
      photoError.value = "Фотографии не добавлены. Выберите файлы и попробуйте снова.";
    }
  } catch {
    photoError.value = "Не удалось загрузить фотографии. Уже добавленные фото сохранены в форме. Выберите файлы ещё раз.";
  }
}

const availabilityPreview = computed(() =>
  scheduleToCalendarRanges(availabilitySchedule.value).map((r) =>
    formatAvailabilityRange(r.from, r.to),
  ),
);
</script>

<template>
  <div class="business-page listing-editor px-4 px-sm-6 py-6">
    <h1 class="gv-display text-h4 mb-4">Новое объявление</h1>

    <v-progress-linear
      v-if="initialLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />
    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
      title="Не удалось загрузить форму"
      ><v-btn variant="text" @click="load">Повторить</v-btn></v-alert
    >
    <div class="listing-editor__layout">
      <nav class="listing-editor__steps" aria-label="Шаги публикации">
        <button
          v-for="s in steps"
          :key="s.n"
          type="button"
          class="step-pill text-caption px-3 py-2 border"
          :class="step === s.n ? 'step-pill--active' : 'step-pill--idle'"
          :aria-current="step === s.n ? 'step' : undefined"
          :disabled="initialLoading || loadError || isSubmitting || isUploading"
          @click="goStep(s.n)"
        >
          {{ s.n }} {{ s.label }}
        </button>
      </nav>
      <section class="business-panel listing-editor__form">
        <p class="text-body-1 font-weight-semibold mb-4">
          Шаг {{ step }} ·
          {{
            step === 1
              ? "Основная информация"
              : step === 5
                ? "График доступности по дням недели"
                : step === 6
                  ? "Проверьте данные и отправьте"
                  : "Заполните поля"
          }}
        </p>

        <div v-show="step === 1" class="max-w-screen-md">
          <v-text-field
            v-model="form.title"
            label="Название оборудования"
            maxlength="140"
            variant="outlined"
            class="mb-3"
            hide-details
          />
          <v-textarea
            v-model="form.description"
            label="Описание (кратко)"
            maxlength="3000"
            variant="outlined"
            class="mb-3"
            hide-details
            rows="3"
          />
          <v-select
            v-model="form.categories"
            :items="categories"
            item-title="name"
            item-value="key"
            label="Категории"
            multiple
            chips
            variant="outlined"
          />
        </div>

        <div v-show="step === 2" class="max-w-screen-md">
          <FileDropzone
            v-model="form.photos"
            :uploading="isUploading"
            :max="5"
            @files="onPhotosSelected"
          />
          <p v-if="photoError" role="alert" class="text-error mt-3">{{ photoError }}</p>
          <p class="text-caption text-medium-emphasis mt-3 mb-0">
            До 5 фотографий. Первое фото станет обложкой объявления.
            Чтобы заменить обложку, удалите первое фото: обложкой станет следующее.
          </p>
        </div>

        <div v-show="step === 3" class="max-w-screen-md">
          <v-text-field
            v-model.number="form.pricePerDay"
            label="Цена за день"
            type="number"
            min="1"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model.number="form.minDays"
            label="Минимальный срок (дней)"
            type="number"
            min="1"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model.number="form.unitsTotal"
            label="Количество единиц"
            type="number"
            min="1"
            variant="outlined"
          />
        </div>

        <div v-show="step === 4" class="max-w-screen-md">
          <v-select
            v-model="form.pickupType"
            :items="[
              { title: 'Самовывоз', value: 'pickup' },
              { title: 'Доставка', value: 'delivery' },
              { title: 'Самовывоз или доставка', value: 'both' },
            ]"
            item-title="title"
            item-value="value"
            label="Способ получения"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.pickupAddress"
            label="Адрес самовывоза"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.deliveryZone"
            label="Зона доставки"
            variant="outlined"
          />
        </div>

        <div v-show="step === 5" class="max-w-screen-lg">
          <ListingWeeklyScheduleEditor v-model="availabilitySchedule" />
        </div>

        <div v-show="step === 6" class="max-w-screen-md">
          <div class="gv-card-elevated pa-4 text-body-2">
            <p>
              <strong>{{ form.title || "—" }}</strong>
            </p>
            <p class="text-medium-emphasis">{{ form.description || "—" }}</p>
            <p>
              Цена: {{ form.pricePerDay }} ₽/день, мин. {{ form.minDays }} дн.
            </p>
            <p
              v-if="availabilityPreview.length"
              class="mt-3 mb-1 font-weight-semibold"
            >
              Доступность:
            </p>
            <ul v-if="availabilityPreview.length" class="ps-4 mb-0">
              <li v-for="(line, i) in availabilityPreview" :key="i">
                {{ line }}
              </li>
            </ul>
            <p v-else class="text-medium-emphasis mt-2">
              Дни доступности не выбраны
            </p>
          </div>
        </div>

        <div class="listing-editor__actions d-flex flex-wrap ga-3 mt-6">
          <v-btn
            variant="outlined"
            color="primary"
            class="gv-cta"
            :disabled="step === 1 || isSubmitting || isUploading"
            @click="prevStep"
          >
            Назад
          </v-btn>
          <v-btn
            v-if="step < 6"
            color="primary"
            class="gv-cta"
            :disabled="initialLoading || loadError || isUploading"
            @click="nextStep"
          >
            Далее
          </v-btn>
          <v-btn
            v-else
            color="primary"
            class="gv-cta"
            :loading="isSubmitting"
            :disabled="
              initialLoading || loadError || isUploading || isSubmitting
            "
            @click="submit"
          >
            Отправить на модерацию
          </v-btn>
        </div>

        <p v-if="errorMessage" role="alert" class="text-error mt-4">
          {{ errorMessage }}
        </p>
      </section>
      <BusinessListingPreview :listing="form" />
    </div>
  </div>
</template>

<style scoped>
.listing-editor__layout {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: start;
}
.listing-editor__steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.listing-editor__steps button {
  text-align: left;
  min-height: 44px;
}
.listing-editor__form {
  min-width: 0;
}
.listing-editor__actions {
  padding-top: 20px;
  border-top: 1px solid var(--gv-border-light);
}
@media (max-width: 1250px) {
  .listing-editor__layout {
    grid-template-columns: minmax(0, 1fr) 260px;
  }
  .listing-editor__steps {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
@media (max-width: 850px) {
  .listing-editor__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  .listing-editor__steps {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .listing-editor__actions .v-btn {
    flex: 1 1 110px;
  }
}

.step-pill {
  cursor: pointer;
  background: var(--gv-bg-page);
  border-radius: var(--gv-radius-btn);
  border-color: var(--gv-border-light) !important;
  color: var(--gv-text-muted);
}

.step-pill--active {
  border-color: var(--gv-primary) !important;
  color: var(--gv-primary);
  font-weight: 600;
  background: var(--gv-primary-soft-bg);
}
</style>
