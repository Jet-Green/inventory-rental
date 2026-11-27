<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "business", "cabinet-layout"],
});

import { toast } from "vue3-toastify";
import CategoryApi from "~/api/CategoryApi";
import { useMyListings } from "~/composables/useMyListings";
import type { ICategory, IRentalListing, ListingStatus } from "~/types/rental";

const {
  listings,
  fetchMyListings,
  fetchActiveBookings,
  submitModeration,
  removeListing,
  updateListing,
  setVisibility,
  activeBookingsByListing,
  actingId,
  isLoading,
} = useMyListings();

const search = ref("");
const statusFilter = ref<ListingStatus | "all">("all");
const deleteDialogOpen = ref(false);
const deleteTargetId = ref("");
const deleteTargetTitle = ref("");

const categories = ref<ICategory[]>([]);

const editDialogOpen = ref(false);
const editTargetId = ref("");
const editForm = reactive({
  title: "",
  description: "",
  categories: [] as string[],
  pricePerDay: 0,
  minDays: 1,
  unitsTotal: 1,
  pickupType: "pickup" as "pickup" | "delivery" | "both",
  pickupAddress: "",
  deliveryZone: "",
});

const STATUS_FILTERS: Array<{ value: ListingStatus | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "draft", label: "Черновик" },
  { value: "pending", label: "На модерации" },
  { value: "active", label: "Опубликовано" },
  { value: "rejected", label: "Отклонено" },
  { value: "hidden", label: "Скрыто" },
];

const loadError = ref(false);
async function load(): Promise<void> {
  loadError.value = false;
  try {
    await fetchMyListings();
  } catch {
    loadError.value = true;
  }
  void fetchActiveBookings();
  try {
    const { categories: list } = await CategoryApi.getVisible();
    categories.value = list;
  } catch {
    categories.value = [];
  }
}
onMounted(() => {
  void load();
});

const filteredListings = computed(() => {
  return listings.value.filter(
    (l) =>
      (statusFilter.value === "all" ||
        l.moderationStatus === statusFilter.value) &&
      l.title
        .toLocaleLowerCase()
        .includes((search.value || "").trim().toLocaleLowerCase()),
  );
});

function priceLabel(price: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽ / день`;
}

/** Отправка черновика/отклонённого объявления на модерацию (draft|rejected → pending). */
async function onSubmitModeration(id: string): Promise<void> {
  if (actingId.value) return;
  await submitModeration(id);
  toast("Объявление отправлено на модерацию.", {
    type: "success",
    autoClose: 4000,
  });
}

function openDelete(id: string, title: string): void {
  deleteTargetId.value = id;
  deleteTargetTitle.value = title;
  deleteDialogOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (actingId.value) return;
  if (!deleteTargetId.value) return;
  await removeListing(deleteTargetId.value);
  deleteDialogOpen.value = false;
  toast("Объявление удалено.", { type: "info", autoClose: 4000 });
}

function openEdit(item: IRentalListing): void {
  editTargetId.value = item._id;
  editForm.title = item.title;
  editForm.description = item.description;
  editForm.categories = (item.categories || []).map((category) =>
    typeof category === "string" ? category : category.key,
  );
  editForm.pricePerDay = item.pricePerDay;
  editForm.minDays = item.minDays;
  editForm.unitsTotal = item.unitsTotal;
  editForm.pickupType = item.pickupType;
  editForm.pickupAddress = item.pickupAddress || "";
  editForm.deliveryZone = item.deliveryZone || "";
  editDialogOpen.value = true;
}

async function saveEdit(): Promise<void> {
  if (actingId.value) return;
  if (!editTargetId.value) return;
  await updateListing(editTargetId.value, {
    title: editForm.title,
    description: editForm.description,
    categories: editForm.categories,
    pricePerDay: Number(editForm.pricePerDay),
    minDays: Number(editForm.minDays),
    unitsTotal: Number(editForm.unitsTotal),
    pickupType: editForm.pickupType,
    pickupAddress: editForm.pickupAddress || undefined,
    deliveryZone: editForm.deliveryZone || undefined,
  });
  editDialogOpen.value = false;
  toast(
    "Объявление обновлено. Опубликованное отправлено на повторную модерацию.",
    {
      type: "success",
      autoClose: 5000,
    },
  );
}

async function onToggleVisibility(item: IRentalListing): Promise<void> {
  if (actingId.value) return;
  const hide = item.moderationStatus === "active";
  await setVisibility(item._id, hide);
  toast(hide ? "Объявление скрыто." : "Объявление снова опубликовано.", {
    type: "success",
    autoClose: 4000,
  });
}
</script>

<template>
  <div class="business-page px-4 px-sm-6 py-6">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-4">
      <h1 class="gv-display text-h4">Мои объявления</h1>
      <v-btn to="/business-cabinet/listings/new" color="primary" class="gv-cta">
        Добавить объявление
      </v-btn>
    </div>

    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
      title="Не удалось загрузить данные"
    >
      <v-btn variant="text" :disabled="isLoading" @click="load"
        >Повторить</v-btn
      >
    </v-alert>
    <div class="business-toolbar">
      <v-text-field
        v-model="search"
        label="Найти оборудование"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        @click:clear="search = ''"
      />
      <v-chip-group v-model="statusFilter" mandatory class="mb-4">
        <v-chip
          v-for="opt in STATUS_FILTERS"
          :key="opt.value"
          :value="opt.value"
          size="small"
          :variant="statusFilter === opt.value ? 'flat' : 'outlined'"
          :color="statusFilter === opt.value ? 'primary' : undefined"
        >
          {{ opt.label }}
        </v-chip>
      </v-chip-group>
    </div>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div v-if="filteredListings.length" class="d-flex flex-column ga-4">
      <div
        v-for="item in filteredListings"
        :key="item._id"
        class="business-panel listing-row"
      >
        <div
          class="listing-row__img"
          :style="
            item.photos?.[0]
              ? { backgroundImage: `url(${item.photos[0]})` }
              : undefined
          "
        />
        <div class="listing-row__details">
          <p class="font-weight-semibold mb-1">{{ item.title }}</p>
          <div class="d-flex align-center ga-2 mb-1 flex-wrap">
            <span class="text-caption text-medium-emphasis">{{
              priceLabel(item.pricePerDay)
            }}</span>
            <StatusChip :status="item.moderationStatus" type="listing" />
          </div>
          <p class="text-caption text-disabled mb-0">
            {{ item.unitsTotal }} шт. · Активных броней:
            {{ activeBookingsByListing[item._id] ?? 0 }}
          </p>
          <p
            v-if="item.moderationStatus === 'rejected' && item.rejectionReason"
            class="text-caption text-error mb-0 mt-1"
          >
            Причина: {{ item.rejectionReason }}
          </p>
        </div>
        <div class="listing-row__actions d-flex ga-2 flex-wrap">
          <v-btn
            variant="outlined"
            color="primary"
            class="gv-cta"
            size="small"
            :to="`/rental-item/${item._id}`"
            target="_blank"
          >
            Открыть
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="gv-cta"
            size="small"
            @click="openEdit(item)"
          >
            Редактировать
          </v-btn>
          <v-btn
            v-if="
              item.moderationStatus === 'draft' ||
              item.moderationStatus === 'rejected'
            "
            variant="outlined"
            color="primary"
            class="gv-cta"
            size="small"
            :loading="actingId === item._id"
            @click="onSubmitModeration(item._id)"
          >
            На модерацию
          </v-btn>
          <v-btn
            v-if="
              item.moderationStatus === 'active' ||
              item.moderationStatus === 'hidden'
            "
            variant="outlined"
            color="primary"
            class="gv-cta"
            size="small"
            :loading="actingId === item._id"
            @click="onToggleVisibility(item)"
          >
            {{ item.moderationStatus === "active" ? "Скрыть" : "Показать" }}
          </v-btn>
          <v-btn
            color="primary"
            class="gv-cta"
            size="small"
            to="/business-cabinet/calendar"
          >
            Календарь
          </v-btn>
          <v-btn
            variant="outlined"
            color="error"
            class="gv-cta"
            size="small"
            :loading="actingId === item._id"
            @click="openDelete(item._id, item.title)"
          >
            Удалить
          </v-btn>
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!isLoading && !loadError"
      :title="listings.length ? 'Объявления не найдены' : 'Объявлений пока нет'"
      :description="
        listings.length
          ? 'Измените поиск или статус.'
          : 'Добавьте первое объявление, чтобы начать сдавать оборудование в аренду.'
      "
      action-title="Добавить объявление"
      @action="navigateTo('/business-cabinet/listings/new')"
    />

    <v-dialog v-model="editDialogOpen" max-width="560">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2"
          >Редактировать объявление</v-card-title
        >
        <v-card-text class="pa-4 pt-2">
          <v-text-field
            v-model="editForm.title"
            label="Название"
            variant="outlined"
            class="mb-3"
            hide-details
          />
          <v-textarea
            v-model="editForm.description"
            label="Описание"
            variant="outlined"
            rows="3"
            class="mb-3"
            hide-details
          />
          <v-select
            v-model="editForm.categories"
            :items="categories"
            item-title="name"
            item-value="key"
            label="Категории"
            multiple
            chips
            variant="outlined"
            class="mb-3"
            hide-details
          />
          <div class="d-flex ga-3 mb-3 flex-wrap">
            <v-text-field
              v-model.number="editForm.pricePerDay"
              label="Цена за день, ₽"
              type="number"
              variant="outlined"
              hide-details
              style="min-width: 140px"
            />
            <v-text-field
              v-model.number="editForm.minDays"
              label="Мин. срок, дней"
              type="number"
              variant="outlined"
              hide-details
              style="min-width: 140px"
            />
            <v-text-field
              v-model.number="editForm.unitsTotal"
              label="Кол-во единиц"
              type="number"
              variant="outlined"
              hide-details
              style="min-width: 140px"
            />
          </div>
          <v-select
            v-model="editForm.pickupType"
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
            hide-details
          />
          <v-text-field
            v-if="editForm.pickupType !== 'delivery'"
            v-model="editForm.pickupAddress"
            label="Адрес самовывоза"
            variant="outlined"
            class="mb-3"
            hide-details
          />
          <v-text-field
            v-if="editForm.pickupType !== 'pickup'"
            v-model="editForm.deliveryZone"
            label="Зона доставки"
            variant="outlined"
            hide-details
          />
          <p class="text-caption text-medium-emphasis mt-3 mb-0">
            Фото и календарь доступности редактируются при пересоздании
            объявления. Опубликованное объявление после правок уходит на
            повторную модерацию.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="action-btn"
            @click="editDialogOpen = false"
            >Отмена</v-btn
          >
          <v-btn
            color="primary"
            class="gv-cta"
            :loading="actingId === editTargetId"
            @click="saveEdit"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card class="pa-2 gv-modal">
        <v-card-title class="text-h6 gv-display pa-4 pb-2"
          >Удалить объявление</v-card-title
        >
        <v-card-text class="pa-4 pt-2 text-body-2 text-medium-emphasis">
          Объявление «{{ deleteTargetTitle }}» будет удалено без возможности
          восстановления.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="action-btn"
            @click="deleteDialogOpen = false"
            >Отмена</v-btn
          >
          <v-btn
            color="error"
            class="gv-cta"
            :loading="!!actingId"
            @click="confirmDelete"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.listing-row {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  align-items: center;
  gap: 16px 20px;
}
.listing-row__details {
  min-width: 0;
}
.listing-row__actions {
  grid-column: 2;
}
@media (max-width: 600px) {
  .listing-row {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 12px;
  }
  .listing-row__actions {
    grid-column: 1 / -1;
  }
  .listing-row__actions .v-btn {
    flex: 1 1 110px;
  }
}

.listing-row__img {
  width: 100%;
  aspect-ratio: 1;
  background: var(--gv-border-light);
  border-radius: var(--gv-radius-thumb);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
</style>
