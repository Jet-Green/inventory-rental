<script setup lang="ts"></script>

<template>
  <div class="layout-default d-flex flex-column min-h-100">
    <AppHeader />
    <v-main class="bg-white flex-grow-1">
      <slot />
    </v-main>
  </div>
</template>

<style scoped>
.min-h-100 {
  min-height: 100vh;
}
</style>
