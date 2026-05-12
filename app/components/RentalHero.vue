<script setup lang="ts">
const { open: openCabinetSelect } = useCabinetSelectDialog();
</script>

<template>
  <section class="hero">
    <div class="page-container hero-content">
      <h1>Аренда инвентаря для поездок и активности</h1>
      <p class="text-muted">
        Спорт, детям, для ОВЗ и походы. Бронируйте с календарем доступности и
        прозрачными условиями.
      </p>
      <div class="d-flex ga-2 mt-4">
        <v-btn to="/listings" color="primary" class="action-btn" size="large">
          Перейти в каталог
        </v-btn>
        <v-btn variant="outlined" class="action-btn" size="large" @click="void openCabinetSelect()">
          Выложить своё объявление
        </v-btn>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 72px 0 48px;
  background: linear-gradient(180deg, #fffef4 0%, #fff9e8 100%);
}

.hero-content {
  max-width: 860px;
}

h1 {
  font-size: clamp(1.8rem, 1.15rem + 2vw, 3rem);
  line-height: 1.05;
  margin-bottom: 16px;
}

p {
  font-size: clamp(1rem, 0.9rem + 0.4vw, 1.2rem);
  margin-bottom: 0;
}
</style>
