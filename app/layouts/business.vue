<script setup lang="ts">
const auth = useAuth();
const route = useRoute();

const nav = [
  { title: "Обзор", to: "/business-cabinet" },
  { title: "Мои объявления", to: "/business-cabinet/listings" },
  { title: "Брони", to: "/business-cabinet/bookings" },
  { title: "Календарь", to: "/business-cabinet/calendar" },
  { title: "Выплаты", to: "/business-cabinet/payouts" },
  { title: "Документы", to: "/business-cabinet/documents" },
  { title: "Верификация", to: "/business-cabinet/verification" },
  { title: "Профиль", to: "/business-cabinet/profile" },
];

function isActive(path: string): boolean {
  if (path === "/business-cabinet/listings") {
    return route.path.startsWith("/business-cabinet/listings");
  }
  return route.path === path;
}
</script>

<template>
  <div class="layout-business d-flex flex-column min-h-100">
    <header class="cabinet-header border-b">
      <div class="cabinet-header__row gv-page-wide px-4 px-sm-6">
        <div class="d-flex align-center ga-3 flex-wrap">
          <NuxtLink to="/" class="gv-display text-decoration-none text-body-1 font-weight-black">
            gorodaivesi.ru
          </NuxtLink>
          <span class="text-primary font-weight-semibold text-caption">Кабинет бизнеса</span>
          <NuxtLink
            to="/cabinet/select"
            class="text-caption px-3 py-2 rounded-lg cabinet-header__pill text-decoration-none"
          >
            Сменить кабинет
          </NuxtLink>
        </div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-btn to="/business-cabinet/listings/new" color="primary" class="gv-cta" rounded="lg">
            Добавить объявление
          </v-btn>
          <v-btn to="/business-cabinet/profile" variant="outlined" color="primary" class="gv-cta" rounded="lg">
            Профиль
          </v-btn>
          <v-btn variant="text" @click="auth.logout">Выйти</v-btn>
        </div>
      </div>
    </header>

    <div class="gv-page-wide px-4 px-sm-6 py-4">
      <div class="business-banner d-flex flex-wrap align-center justify-space-between ga-3 pa-4 rounded-lg">
        <span class="text-body-2 font-weight-semibold">Для публикации объявлений пройдите верификацию</span>
        <v-btn to="/business-cabinet/verification" color="primary" class="gv-cta" rounded="lg">
          Пройти верификацию
        </v-btn>
      </div>
    </div>

    <div class="cabinet-shell d-flex">
      <aside class="cabinet-shell__nav border-e">
        <nav class="pa-4">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="cabinet-nav-link d-block text-decoration-none pa-3 rounded-lg mb-1"
            :class="{ 'cabinet-nav-link--active': isActive(item.to) }"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>
      </aside>
      <v-main class="cabinet-shell__main bg-white flex-grow-1">
        <slot />
      </v-main>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #f0f0f0 !important;
}

.border-e {
  border-right: 1px solid #f0f0f0 !important;
}

.cabinet-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.cabinet-header__pill {
  background: var(--gv-primary-soft-bg);
  color: rgba(0, 0, 0, 0.65);
}

.business-banner {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
}

.cabinet-shell__nav {
  width: 260px;
  flex-shrink: 0;
  background: var(--gv-sidebar);
  min-height: calc(100vh - 200px);
}

.cabinet-nav-link {
  color: rgba(0, 0, 0, 0.55);
  font-size: 14px;
}

.cabinet-nav-link--active {
  background: var(--gv-primary-soft-bg);
  color: var(--gv-primary);
  font-weight: 600;
}

@media (max-width: 960px) {
  .cabinet-shell {
    flex-direction: column;
  }
  .cabinet-shell__nav {
    width: 100%;
    min-height: 0;
  }
}

.min-h-100 {
  min-height: 100vh;
}
</style>
