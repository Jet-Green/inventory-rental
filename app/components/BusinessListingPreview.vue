<script setup lang="ts">
defineProps<{
  listing: {
    title: string;
    description: string;
    photos: string[];
    pricePerDay: number;
    minDays: number;
    unitsTotal: number;
  };
}>();
</script>

<template>
  <aside class="business-panel listing-editor__summary">
    <h2 class="text-h6 mb-2">Предпросмотр объявления</h2>
    <p class="business-muted text-caption mb-4">
      Краткая сводка введённых данных. Объявление ещё не отправлено на модерацию.
    </p>
    <img
      v-if="listing.photos[0]"
      :src="listing.photos[0]"
      alt="Обложка объявления"
      class="listing-editor__cover mb-4"
    />
    <p class="font-weight-semibold mb-2">
      {{ listing.title || "Название оборудования" }}
    </p>
    <p class="business-muted mb-4">
      {{ listing.description || "Описание появится здесь" }}
    </p>
    <dl class="listing-editor__facts">
      <div>
        <dt>Цена за день</dt>
        <dd>
          {{ new Intl.NumberFormat("ru-RU").format(listing.pricePerDay) }} ₽
        </dd>
      </div>
      <div>
        <dt>Минимальный срок</dt>
        <dd>{{ listing.minDays }} дн.</dd>
      </div>
      <div>
        <dt>Количество</dt>
        <dd>{{ listing.unitsTotal }} шт.</dd>
      </div>
      <div>
        <dt>Фотографии</dt>
        <dd>{{ listing.photos.length }} / 5</dd>
      </div>
    </dl>
  </aside>
</template>

<style scoped>
.listing-editor__summary {
  min-width: 0;
  overflow-wrap: anywhere;
}
.listing-editor__cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: var(--gv-radius-thumb);
}
.listing-editor__facts > div {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-block: 12px;
  border-top: 1px solid var(--gv-border-light);
  font-size: 13px;
}
.listing-editor__facts dt {
  color: var(--gv-text-secondary);
}
.listing-editor__facts dd {
  text-align: right;
  font-weight: 600;
}
</style>
