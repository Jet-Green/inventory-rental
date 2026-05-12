<script setup lang="ts">
const auth = useAuth();
const route = useRoute();

const items = [
  { title: "Дашборд", to: "/admin" },
  { title: "Категории", to: "/admin/categories" },
  { title: "Модерация", to: "/admin/moderation" },
  { title: "Пользователи", to: "/admin/users" },
];

function navActive(to: string): boolean {
  if (to === "/admin") {
    return route.path === "/admin";
  }
  return route.path === to || route.path.startsWith(`${to}/`);
}

const sectionTitle = computed(() => {
  if (route.path.includes("categories")) return "Категории";
  if (route.path.includes("moderation")) return "Модерация";
  if (route.path.includes("users")) return "Пользователи";
  return "Дашборд";
});
</script>

<template>
  <div class="layout-admin d-flex flex-column min-h-100">
    <header class="admin-top border-b">
      <div class="d-flex align-center ga-3 flex-wrap px-5 py-3">
        <span class="gv-display font-weight-black">gorodaivesi · Админка</span>
        <span class="text-primary font-weight-semibold text-caption">{{ sectionTitle }}</span>
        <v-spacer />
        <v-btn variant="text" size="small" to="/cabinet">Кабинет</v-btn>
        <v-btn variant="text" size="small" to="/listings">Каталог</v-btn>
        <v-btn variant="text" size="small" @click="auth.logout">Выйти</v-btn>
      </div>
    </header>
    <div class="d-flex">
      <aside class="admin-nav border-e">
        <nav class="pa-4">
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="admin-nav-link d-block text-decoration-none pa-3 rounded-lg mb-1 text-caption"
            :class="{ 'admin-nav-link--active': navActive(item.to) }"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>
      </aside>
      <v-main class="flex-grow-1 bg-white">
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

.admin-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--gv-sidebar);
  min-height: calc(100vh - 56px);
}

.admin-nav-link {
  color: rgba(0, 0, 0, 0.5);
}

.admin-nav-link--active {
  background: var(--gv-primary-soft-bg);
  color: var(--gv-primary);
  font-weight: 600;
}

.min-h-100 {
  min-height: 100vh;
}
</style>
