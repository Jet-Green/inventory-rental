<script setup lang="ts">
defineProps<{
  title: string;
  photo?: string;
  selectionSummary: string;
  totalPrice: number;
}>();
</script>

<template>
  <aside class="booking-order-summary gv-card-elevated" aria-label="Ваш заказ">
    <v-img v-if="photo" :src="photo" :alt="title" cover height="180" />
    <div class="pa-5">
      <h2 class="text-h6 mb-4">Ваш заказ</h2>
      <p class="font-weight-semibold mb-4">{{ title }}</p>
      <p class="text-body-2 text-medium-emphasis mb-2">{{ selectionSummary }}</p>
      <div class="booking-order-summary__price">
        <span>Предварительно</span>
        <strong>{{ new Intl.NumberFormat('ru-RU').format(totalPrice) }} ₽</strong>
      </div>
      <p class="text-caption text-medium-emphasis mt-3">
        Проверьте период и количество перед оформлением.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.booking-order-summary {
  position: sticky;
  top: 24px;
  overflow: hidden;
}

.booking-order-summary__price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
  padding-top: 18px;
  border-top: 1px solid var(--gv-border-light);
}

.booking-order-summary__price strong { font-size: 24px; }

@media (max-width: 959px) {
  .booking-order-summary { position: static; }
}
</style>
