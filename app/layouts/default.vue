<script setup lang="ts"></script>

<template>
  <div class="layout-default d-flex flex-column min-h-100">
    <AppHeader />
    <v-main class="layout-default__main flex-grow-1">
      <slot />
    </v-main>
    <AppFooter />
  </div>
</template>

<style scoped>
.min-h-100 {
  min-height: 100vh;
}

.layout-default__main {
  background: var(--gv-bg-page);
}
</style>
