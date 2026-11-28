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
  <div class="private-page px-4 px-sm-6 py-8">
    <div class="d-flex align-center ga-3 mb-6 flex-wrap">
      <h1 class="gv-display text-h4 mb-0">Уведомления</h1>
      <v-chip size="small" variant="tonal" color="error">Не подключено</v-chip>
    </div>

    <div class="gv-card-elevated channel-card pa-6 mb-6">
      <div class="channel-heading mb-5"><v-icon icon="mdi-send-outline" size="32" color="primary" /><h2 class="text-h6">Telegram</h2></div>
      <p class="text-body-2 font-weight-semibold mb-3">Вы будете получать уведомления:</p>
      <p
        v-for="event in events"
        :key="event"
        class="event-row text-body-2 text-medium-emphasis d-flex align-center ga-3"
      >
        <v-icon icon="mdi-check" color="primary" size="18" />
        {{ event }}
      </p>
    <div class="d-flex ga-3 flex-wrap mt-6">
      <v-btn color="primary" class="gv-cta" @click="notImplemented">
        Подключить Telegram
      </v-btn>

    </div>
    </div>
  </div>
</template>

<style scoped>
.channel-card { max-width: 800px; }
.channel-heading { display: flex; align-items: center; gap: 14px; }
.event-row { padding: 14px 0; border-bottom: 1px solid var(--gv-border-light); }
</style>
