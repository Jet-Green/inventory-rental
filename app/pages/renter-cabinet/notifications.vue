<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "renter", "cabinet-layout"],
});

import { toast } from "vue3-toastify";

const events = [
  "Новая бронь",
  "Подтверждение брони",
  "Отмена брони",
  "Напоминание о начале аренды",
  "Напоминание об окончании аренды",
];

function notImplemented(): void {
  toast("Функция в разработке.", { type: "info", autoClose: 4000 });
}
</script>

<template>
  <div class="px-4 px-sm-6 py-8">
    <div class="d-flex align-center ga-3 mb-6 flex-wrap">
      <h1 class="gv-display text-h4 mb-0">Уведомления</h1>
      <v-chip size="small" variant="tonal" color="error">Не подключено</v-chip>
    </div>

    <div class="gv-card-elevated pa-6 mb-6" style="max-width: 900px">
      <p class="text-body-2 font-weight-semibold mb-3">Вы будете получать уведомления:</p>
      <p
        v-for="event in events"
        :key="event"
        class="text-body-2 text-medium-emphasis d-flex align-center ga-2 mb-2"
      >
        <v-icon icon="mdi-bell-outline" size="16" />
        {{ event }}
      </p>
    </div>

    <div class="d-flex ga-3 flex-wrap">
      <v-btn color="primary" class="gv-cta" rounded="lg" @click="notImplemented">
        Подключить Telegram
      </v-btn>
      <v-btn variant="outlined" color="primary" class="gv-cta" rounded="lg" @click="notImplemented">
        Отключить
      </v-btn>
    </div>
  </div>
</template>
