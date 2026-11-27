<script setup lang="ts">
const auth = useAuth();
const route = useRoute();
const menuOpen = ref(false);
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
const currentTitle = computed(
  () => nav.find((item) => isActive(item.to))?.title || "Кабинет бизнеса",
);
const { isBusiness } = useRole();
const { open: openCabinetSelect } = useCabinetSelectDialog();

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
        <div
          class="cabinet-header__identity d-flex align-center ga-3 flex-wrap"
        >
          <NuxtLink
            to="/"
            class="text-decoration-none"
            aria-label="Аренда инвентаря"
          >
            <AppLogo :size="26" />
          </NuxtLink>
          <span class="text-primary font-weight-semibold text-caption"
            >Кабинет бизнеса</span
          >
          <button
            type="button"
            class="text-caption px-3 py-2 cabinet-header__pill text-decoration-none"
            @click="void openCabinetSelect()"
          >
            Сменить кабинет
          </button>
        </div>
        <div class="cabinet-header__actions d-flex align-center ga-2 flex-wrap">
          <v-btn
            to="/business-cabinet/listings/new"
            color="primary"
            class="gv-cta cabinet-header__create"
          >
            Добавить объявление
          </v-btn>
          <v-btn
            to="/business-cabinet/profile"
            variant="outlined"
            color="primary"
            class="gv-cta"
          >
            Профиль
          </v-btn>
          <v-btn variant="text" class="action-btn" @click="auth.logout"
            >Выйти</v-btn
          >
        </div>
      </div>
    </header>

    <div v-if="!isBusiness" class="gv-page-wide px-4 px-sm-6 py-4">
      <div
        class="business-banner d-flex flex-wrap align-center justify-space-between ga-3 pa-4"
      >
        <span class="text-body-2 font-weight-semibold"
          >Для публикации объявлений пройдите верификацию</span
        >
        <v-btn
          to="/business-cabinet/verification"
          color="primary"
          class="gv-cta"
        >
          Пройти верификацию
        </v-btn>
      </div>
    </div>

    <div class="cabinet-shell d-flex">
      <aside class="cabinet-shell__nav border-e">
        <button
          type="button"
          class="cabinet-mobile-menu"
          :aria-expanded="menuOpen"
          aria-controls="business-navigation"
          @click="menuOpen = !menuOpen"
        >
          <span>{{ currentTitle }}</span><v-icon
            :icon="menuOpen ? 'mdi-chevron-up' : 'mdi-menu'"
            size="22"
          />
        </button>
        <nav
          id="business-navigation"
          class="pa-4"
          :class="{ 'cabinet-navigation--open': menuOpen }"
          aria-label="Кабинет бизнеса"
        >
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            class="cabinet-nav-link d-block text-decoration-none pa-3 mb-1"
            :class="{ 'cabinet-nav-link--active': isActive(item.to) }"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>
      </aside>
      <v-main class="cabinet-shell__main flex-grow-1">
        <slot />
      </v-main>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid var(--gv-border-light) !important;
}

.border-e {
  border-right: 1px solid var(--gv-border-light) !important;
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
  border: 1px solid var(--gv-primary-soft-border);
  border-radius: var(--gv-radius-btn);
  color: var(--gv-text-secondary);
}

.business-banner {
  background: var(--gv-primary-soft-bg);
  border: 1px solid var(--gv-primary-soft-border);
  border-radius: var(--gv-radius-card);
}

.cabinet-mobile-menu {
  display: none;
}

.cabinet-shell__main {
  min-width: 0;
  background: var(--gv-bg-page);
}

.cabinet-shell__nav {
  width: 260px;
  flex-shrink: 0;
  background: var(--gv-sidebar);
  min-height: calc(100vh - 200px);
}

.cabinet-nav-link {
  color: var(--gv-text-secondary);
  border-radius: var(--gv-radius-btn);
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
    border-right: 0 !important;
    border-bottom: 1px solid var(--gv-border-light);
  }
  .cabinet-mobile-menu {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 20px;
    color: var(--gv-primary);
    font-weight: 600;
    text-align: left;
  }
  #business-navigation {
    display: none;
  }
  #business-navigation.cabinet-navigation--open {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cabinet-header__row {
    flex-wrap: wrap;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  .cabinet-header__identity,
  .cabinet-header__actions {
    width: 100%;
  }
  .cabinet-header__identity > span {
    display: none;
  }
  .cabinet-header__identity {
    justify-content: space-between;
  }
  .cabinet-header__actions {
    gap: 6px !important;
  }
  .cabinet-header__create {
    flex: 1;
  }
  .cabinet-header__actions .v-btn {
    font-size: 10px;
    padding-inline: 10px;
    min-width: 0;
  }
  .cabinet-header__actions .v-btn:nth-child(2) {
    display: none;
  }
  .cabinet-nav-link {
    font-size: 13px;
    margin-bottom: 0 !important;
  }
}

:deep(.business-page) {
  max-width: 1440px;
  margin-inline: auto;
  overflow-wrap: anywhere;
}
:deep(.business-toolbar) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--gv-card-bg, #fff);
  border: 1px solid var(--gv-border-light);
  border-radius: var(--gv-radius-card);
  margin-bottom: 20px;
}
:deep(.business-toolbar .v-input) {
  flex: 1 1 220px;
  min-width: 0;
}
:deep(.business-panel) {
  border: 1px solid var(--gv-border-light);
  border-radius: var(--gv-radius-card);
  background: var(--gv-card-bg, #fff);
  padding: 24px;
  min-width: 0;
}
:deep(.business-split) {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 1fr);
  gap: 24px;
  align-items: start;
}
:deep(.business-section-heading) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
:deep(.business-section-heading h2) {
  font-size: 20px;
  font-weight: 600;
}
:deep(.business-muted) {
  color: var(--gv-text-secondary);
  font-size: 14px;
}
:deep(.business-page .v-btn__content) {
  white-space: normal;
}
:deep(.business-page .v-btn) {
  max-width: 100%;
}
:deep(.business-page .v-input) {
  min-width: 0;
}
:deep(.business-page .text-h4) {
  font-size: clamp(26px, 3vw, 34px) !important;
  line-height: 1.2;
}
@media (max-width: 1100px) {
  :deep(.business-split) {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 600px) {
  :deep(.business-panel) {
    padding: 18px 16px;
  }
  :deep(.business-toolbar) {
    padding: 12px;
  }
  :deep(.business-page) {
    padding-top: 24px !important;
    padding-bottom: 32px !important;
  }
  :deep(.business-page .gv-cta) {
    letter-spacing: 0.02em;
  }
}
.min-h-100 {
  min-height: 100vh;
}
</style>
