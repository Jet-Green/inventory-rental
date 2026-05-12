<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <h1 class="gv-display text-h4 mb-2">Уведомления</h1>
    <p class="text-primary font-weight-semibold text-body-2 mb-6">
      Статус Telegram: не подключено
    </p>

    <div class="gv-card-elevated pa-6 mb-6" style="max-width: 900px">
      <p class="text-body-2 text-medium-emphasis mb-2">• Новая бронь</p>
      <p class="text-body-2 text-medium-emphasis mb-2">• Подтверждение брони</p>
      <p class="text-body-2 text-medium-emphasis mb-2">• Отмена брони</p>
      <p class="text-body-2 text-medium-emphasis mb-2">• Напоминание о начале аренды</p>
      <p class="text-body-2 text-medium-emphasis">• Напоминание об окончании аренды</p>
    </div>

    <div class="d-flex ga-3 flex-wrap">
      <v-btn color="primary" class="gv-cta" rounded="lg">Подключить Telegram</v-btn>
      <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" disabled>
        Отключить
      </v-btn>
    </div>
  </div>
</template>
