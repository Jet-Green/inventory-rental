<script setup lang="ts">
const auth = useAuth();
const route = useRoute();

const nav = [
  { title: "Мои аренды", to: "/renter-cabinet/rentals" },
  { title: "Документы", to: "/renter-cabinet/documents" },
  { title: "Профиль", to: "/renter-cabinet/profile" },
  { title: "Верификация", to: "/renter-cabinet/verification" },
  { title: "Уведомления", to: "/renter-cabinet/notifications" },
];

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<template>
  <div class="layout-renter d-flex flex-column min-h-100">
    <header class="cabinet-header border-b">
      <div class="cabinet-header__row gv-page-wide px-4 px-sm-6">
        <div class="d-flex align-center ga-3 flex-wrap">
          <NuxtLink to="/" class="gv-display text-decoration-none text-body-1 font-weight-black">
            gorodaivesi.ru
          </NuxtLink>
          <span class="text-primary font-weight-semibold text-caption">Личный кабинет</span>
          <NuxtLink
            to="/cabinet/select"
            class="text-caption px-3 py-2 rounded-lg cabinet-header__pill text-decoration-none"
          >
            Сменить кабинет
          </NuxtLink>
        </div>
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-btn to="/cabinet/select" variant="outlined" color="primary" class="gv-cta" rounded="lg">
            Разместить объявление
          </v-btn>
          <v-btn to="/renter-cabinet/profile" color="primary" class="gv-cta" rounded="lg">
            Профиль
          </v-btn>
          <v-btn variant="text" @click="auth.logout">Выйти</v-btn>
        </div>
      </div>
    </header>
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

.cabinet-shell__nav {
  width: 260px;
  flex-shrink: 0;
  background: var(--gv-sidebar);
  min-height: calc(100vh - 72px);
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
