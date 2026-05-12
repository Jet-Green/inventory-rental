<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});
</script>

<template>
  <div class="px-5 py-6">
    <h1 class="gv-display text-h4 mb-2">Пользователи</h1>
    <p class="text-caption text-medium-emphasis mb-6">Роль: все · Верификация: все</p>

    <div class="border rounded-lg overflow-hidden">
      <div
        class="d-flex ga-2 px-3 py-2 bg-grey-lighten-4 text-caption font-weight-semibold text-medium-emphasis flex-wrap"
      >
        <span style="min-width: 120px">Пользователь</span>
        <span style="min-width: 70px">Тип</span>
        <span style="min-width: 80px">Роль</span>
        <span style="min-width: 70px">Вериф.</span>
        <span style="min-width: 50px">Объявл.</span>
        <span style="min-width: 50px">Брони</span>
        <span style="min-width: 60px">Аккаунт</span>
        <span style="min-width: 120px">Действия</span>
      </div>
      <div class="d-flex ga-2 px-3 py-2 border-t align-center flex-wrap text-caption">
        <span style="min-width: 120px">anna@mail.ru</span>
        <span style="min-width: 70px">Физлицо</span>
        <span style="min-width: 80px">Пользователь</span>
        <span style="min-width: 70px">Подтверждена</span>
        <span style="min-width: 50px">0</span>
        <span style="min-width: 50px">3</span>
        <span style="min-width: 60px">Активен</span>
        <div class="d-flex ga-2">
          <v-btn size="small" variant="outlined" color="primary" class="gv-cta" to="/admin">
            Проф.
          </v-btn>
          <v-btn size="small" variant="outlined" color="primary" class="gv-cta" disabled>
            Блок
          </v-btn>
        </div>
      </div>
    </div>
    <p class="text-caption text-medium-emphasis mt-4">
      Полный список пользователей подключается к API отдельно.
    </p>
  </div>
</template>
