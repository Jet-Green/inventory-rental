<script setup lang="ts">
import CategoryApi from "~/api/CategoryApi";
import RentalApi from "~/api/RentalApi";
import { useAuthProfile } from "~/composables/useAuthProfile";
import type { ICategory } from "~/types/rental";

const router = useRouter();
const { profile, fetchProfile } = useAuthProfile();
const categories = ref<ICategory[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref("");
const step = ref(1);

const form = reactive({
  title: "",
  description: "",
  categories: [] as string[],
  photos: [""],
  pricePerDay: 1000,
  minDays: 1,
  unitsTotal: 1,
  pickupType: "pickup" as "pickup" | "delivery" | "both",
  pickupAddress: "",
  deliveryZone: "",
  calendarText: "",
});

const steps = [
  { n: 1, label: "Инфо" },
  { n: 2, label: "Фото" },
  { n: 3, label: "Цена" },
  { n: 4, label: "Получение" },
  { n: 5, label: "Календарь" },
  { n: 6, label: "Просмотр" },
];

onMounted(async () => {
  await fetchProfile();
  const response = await CategoryApi.getVisible();
  categories.value = response.categories;
});

async function submit(): Promise<void> {
  errorMessage.value = "";
  if (!profile.value?.isLessorVerified) {
    errorMessage.value =
      "Перед публикацией объявления пройдите верификацию бизнеса.";
    return;
  }

  try {
    isSubmitting.value = true;
    const calendar = form.calendarText
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => {
        const [from, to] = row.split(",");
        return { from: (from || "").trim(), to: (to || "").trim() };
      })
      .filter((x) => x.from && x.to);

    await RentalApi.create({
      title: form.title,
      description: form.description,
      categories: form.categories,
      photos: form.photos.filter(Boolean),
      pricePerDay: form.pricePerDay,
      minDays: form.minDays,
      unitsTotal: form.unitsTotal,
      pickupType: form.pickupType,
      pickupAddress: form.pickupAddress || undefined,
      deliveryZone: form.deliveryZone || undefined,
      calendar,
    });
    await router.push("/business-cabinet/listings");
  } finally {
    isSubmitting.value = false;
  }
}

function nextStep(): void {
  step.value = Math.min(6, step.value + 1);
}

function prevStep(): void {
  step.value = Math.max(1, step.value - 1);
}
</script>

<template>
  <div class="px-4 px-sm-6 py-6">
    <h1 class="gv-display text-h4 mb-4">Новое объявление</h1>

    <div class="d-flex flex-wrap ga-2 mb-6">
      <button
        v-for="s in steps"
        :key="s.n"
        type="button"
        class="step-pill text-caption px-3 py-2 rounded-lg border"
        :class="step === s.n ? 'step-pill--active' : 'step-pill--idle'"
        @click="step = s.n"
      >
        {{ s.n }} {{ s.label }}
      </button>
    </div>

    <p class="text-body-1 font-weight-semibold mb-4">
      Шаг {{ step }} ·
      {{
        step === 1
          ? "Основная информация"
          : step === 6
            ? "Проверьте данные и отправьте"
            : "Заполните поля"
      }}
    </p>

    <div v-show="step === 1" class="max-w-screen-md">
      <v-text-field
        v-model="form.title"
        placeholder="Название оборудования"
        variant="outlined"
        rounded="lg"
        class="mb-3"
        hide-details
      />
      <v-textarea
        v-model="form.description"
        placeholder="Описание (кратко)"
        variant="outlined"
        rounded="lg"
        class="mb-3"
        hide-details
        rows="3"
      />
      <v-select
        v-model="form.categories"
        :items="categories"
        item-title="name"
        item-value="key"
        placeholder="Категории"
        multiple
        chips
        variant="outlined"
        rounded="lg"
      />
    </div>

    <div v-show="step === 2" class="max-w-screen-md">
      <div v-for="(photo, index) in form.photos" :key="index" class="mb-2">
        <v-text-field
          v-model="form.photos[index]"
          :label="`URL фото ${index + 1}`"
          variant="outlined"
          rounded="lg"
          hide-details
        />
      </div>
      <v-btn
        v-if="form.photos.length < 5"
        variant="text"
        @click="form.photos.push('')"
      >
        Добавить фото
      </v-btn>
    </div>

    <div v-show="step === 3" class="max-w-screen-md">
      <v-text-field
        v-model.number="form.pricePerDay"
        label="Цена за день"
        type="number"
        variant="outlined"
        rounded="lg"
        class="mb-3"
      />
      <v-text-field
        v-model.number="form.minDays"
        label="Минимальный срок (дней)"
        type="number"
        variant="outlined"
        rounded="lg"
        class="mb-3"
      />
      <v-text-field
        v-model.number="form.unitsTotal"
        label="Количество единиц"
        type="number"
        variant="outlined"
        rounded="lg"
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
        rounded="lg"
        class="mb-3"
      />
      <v-text-field
        v-model="form.pickupAddress"
        label="Адрес самовывоза"
        variant="outlined"
        rounded="lg"
        class="mb-3"
      />
      <v-text-field
        v-model="form.deliveryZone"
        label="Зона доставки"
        variant="outlined"
        rounded="lg"
      />
    </div>

    <div v-show="step === 5" class="max-w-screen-md">
      <v-textarea
        v-model="form.calendarText"
        label="Календарь (каждая строка: YYYY-MM-DD,YYYY-MM-DD)"
        hint="Пример: 2026-05-01,2026-05-07"
        variant="outlined"
        rounded="lg"
      />
    </div>

    <div v-show="step === 6" class="max-w-screen-md">
      <div class="gv-card-elevated pa-4 text-body-2">
        <p><strong>{{ form.title || "—" }}</strong></p>
        <p class="text-medium-emphasis">{{ form.description || "—" }}</p>
        <p>Цена: {{ form.pricePerDay }} ₽/день, мин. {{ form.minDays }} дн.</p>
      </div>
    </div>

    <div class="d-flex flex-wrap ga-3 mt-6">
      <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" @click="prevStep">
        Назад
      </v-btn>
      <v-btn
        v-if="step < 6"
        color="primary"
        class="gv-cta"
        rounded="lg"
        @click="nextStep"
      >
        Далее
      </v-btn>
      <v-btn
        color="primary"
        class="gv-cta"
        rounded="lg"
        :loading="isSubmitting"
        @click="submit"
      >
        Отправить на модерацию
      </v-btn>
    </div>

    <p v-if="errorMessage" class="text-error mt-4">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.step-pill {
  cursor: pointer;
  background: #fafafa;
  border-color: #e8e8e8 !important;
  color: rgba(0, 0, 0, 0.45);
}

.step-pill--active {
  border-color: var(--gv-primary) !important;
  color: var(--gv-primary);
  font-weight: 600;
  background: var(--gv-primary-soft-bg);
}
</style>
