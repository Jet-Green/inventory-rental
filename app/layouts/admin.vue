<script setup lang="ts">
const auth = useAuth();
const route = useRoute();
const menuOpen = ref(false);
watch(() => route.path, () => { menuOpen.value = false; });

const items = [
  { title: "Дашборд", icon: "mdi-view-dashboard-outline", to: "/admin" },
  { title: "Категории", icon: "mdi-shape-outline", to: "/admin/categories" },
  { title: "Модерация", icon: "mdi-shield-check-outline", to: "/admin/moderation" },
  { title: "Пользователи", icon: "mdi-account-group-outline", to: "/admin/users" },
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
      <div class="admin-header-row">
        <NuxtLink to="/" class="text-decoration-none" aria-label="Аренда инвентаря">
          <AppLogo :size="24" />
        </NuxtLink>
        <span class="admin-header-label">Управление</span>

        <v-spacer />
        <v-btn variant="text" size="small" class="action-btn" to="/">На сайт</v-btn>
        <v-btn variant="text" size="small" class="action-btn" @click="auth.logout">Выйти</v-btn>
      </div>
    <button class="mobile-menu" type="button" :aria-expanded="menuOpen" aria-controls="admin-navigation" @click="menuOpen = !menuOpen">
        <v-icon icon="mdi-menu" size="20" /> {{ sectionTitle }} <v-icon :icon="menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
      </button>
    </header>
    <div class="admin-shell">
      <aside id="admin-navigation" class="admin-nav border-e" :class="{ 'navigation-open': menuOpen }">
        <nav class="pa-4" aria-label="Управление сайтом">
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="admin-nav-link text-decoration-none pa-3 mb-1"
            :aria-current="navActive(item.to) ? 'page' : undefined"
            :class="{ 'admin-nav-link--active': navActive(item.to) }"
          >
            <v-icon :icon="item.icon" size="20" aria-hidden="true" />
            {{ item.title }}
          </NuxtLink>
        </nav>
      </aside>
      <v-main class="admin-main flex-grow-1">
        <slot />
      </v-main>
    </div>
  </div>
</template>

<style scoped>
.layout-admin, .layout-renter { min-height: 100vh; background: var(--gv-bg-page); }
.admin-top, .cabinet-header { background: white; border-bottom: 1px solid var(--gv-border-light); }
.admin-header-row, .cabinet-header__row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 28px; }
.admin-header-label, .cabinet-header-label { font-size: 13px; color: var(--gv-text-secondary); }
.admin-shell, .cabinet-shell { display: flex; flex: 1; min-width: 0; }
.admin-nav, .cabinet-shell__nav { width: 236px; flex-shrink: 0; background: white; border-right: 1px solid var(--gv-border-light); }
.admin-nav-link, .cabinet-nav-link { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--gv-text-secondary); border-radius: 10px; min-height: 48px; }
.admin-nav-link:hover, .cabinet-nav-link:hover { background: var(--gv-bg-page); }
.admin-nav-link--active, .cabinet-nav-link--active { color: var(--gv-primary); background: var(--gv-primary-soft-bg); font-weight: 600; }
.admin-main, .cabinet-shell__main { min-width: 0; width: 0; flex: 1; background: var(--gv-bg-page); }
.cabinet-header__pill { color: var(--gv-text-secondary); border: 1px solid var(--gv-border-light); border-radius: 8px; }
.mobile-menu { display: none; }
:deep(.private-page) { max-width: 1380px; margin-inline: auto; padding: 36px !important; min-width: 0; }
:deep(.private-page h1) { font-size: 32px !important; letter-spacing: -.8px !important; line-height: 1.2; font-weight: 650; }
:deep(.private-page h2), :deep(.private-page h3) { font-weight: 600; letter-spacing: -.3px; }
:deep(.private-page .gv-card-elevated) { box-shadow: none; border: 1px solid var(--gv-border-light); border-radius: 16px; }
:deep(.private-page .v-table) { width: 100%; max-width: 100%; border-radius: 12px; }
:deep(.private-page .v-table__wrapper) { overflow-x: auto; }
:deep(.private-page table) { min-width: 720px; }
:deep(.private-page th) { background: var(--gv-bg-page); font-size: 12px; color: var(--gv-text-secondary); white-space: nowrap; }
:deep(.private-page td) { padding-block: 16px !important; font-size: 13px; }
:deep(.private-page .v-chip-group) { border-bottom: 1px solid var(--gv-border-light); padding-bottom: 16px; }
:deep(.private-page .v-chip) { font-weight: 500; }
:deep(.private-page .v-btn) { letter-spacing: 0; }
@media (max-width: 960px) {
 .admin-shell, .cabinet-shell { flex-direction: column; }
 .admin-main, .cabinet-shell__main { width: 100%; }
 .admin-nav, .cabinet-shell__nav { display: none; width: 100%; min-height: 0; border-right: 0; border-bottom: 1px solid var(--gv-border-light); }
 .navigation-open { display: block; }
 .mobile-menu { display: flex; align-items: center; gap: 10px; min-height: 50px; padding: 12px 20px; width: 100%; color: var(--gv-text-primary); font-size: 14px; text-align: left; border-top: 1px solid var(--gv-border-light); }
 .mobile-menu > :last-child { margin-left: auto; }
 .admin-header-row, .cabinet-header__row { padding: 16px 20px; flex-wrap: wrap; }
 :deep(.private-page) { padding: 24px 20px !important; }
 :deep(.private-page h1) { font-size: 28px !important; }
}
@media (max-width: 480px) {
 .admin-header-label, .cabinet-header-label { display: none; }
 .cabinet-header__row > :last-child { width: 100%; }
 .cabinet-header__row > :last-child > :first-child { flex: 1; }
 :deep(.private-page) { padding: 24px 16px !important; }
 :deep(.private-page h1) { overflow-wrap: anywhere; }
 :deep(.private-page .v-card-actions) { flex-wrap: wrap; }
}
</style>
