<template>
  <v-skeleton-loader
    type="image, list-item-two-line"
    class="listing-skeleton"
    height="175"
  />
</template>

<style scoped>
.listing-skeleton {
  border-radius: var(--gv-radius-card);
  border: 1px solid var(--gv-border-light);
  overflow: hidden;
}
</style>
