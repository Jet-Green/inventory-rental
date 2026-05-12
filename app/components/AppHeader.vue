<script setup lang="ts">
const auth = useAuth();
const { user } = storeToRefs(auth);
const route = useRoute();

type HeaderVariant = "marketing" | "compact" | "minimal";

const variant = computed<HeaderVariant>(() => {
  const p = route.path;
  if (p.startsWith("/booking/success")) return "minimal";
  if (
    p.startsWith("/rental-item") ||
    /^\/listings\/[^/]+$/.test(p)
  ) {
    return "compact";
  }
  return "marketing";
});

const isOpen = ref(false);
const { open: openCabinetSelectDialog } = useCabinetSelectDialog();

function closeDrawer(): void {
  isOpen.value = false;
}

function go(to: string): void {
  closeDrawer();
  navigateTo(to);
}

function openPlaceListing(): void {
  closeDrawer();
  void openCabinetSelectDialog();
}
</script>

<template>
  <header
    class="gv-header"
    :class="{
      'gv-header--marketing': variant === 'marketing',
      'gv-header--compact': variant === 'compact',
      'gv-header--minimal': variant === 'minimal',
    }"
  >
    <div class="gv-header__inner gv-page-wide">
      <div class="gv-header__brand">
        <NuxtLink to="/" class="gv-header__logo gv-display">gorodaivesi.ru</NuxtLink>
        <p v-if="variant === 'marketing'" class="gv-header__tagline">
          Аренда оборудования
        </p>
        <span v-if="variant === 'compact'" class="gv-header__catalog-note">
          · Каталог аренды
        </span>
      </div>

      <ClientOnly>
        <div v-if="variant !== 'minimal'" class="gv-header__actions d-none d-md-flex">
          <v-btn
            v-if="variant === 'marketing'"
            variant="outlined"
            color="primary"
            class="gv-cta"
            rounded="lg"
            @click="openPlaceListing"
          >
            Разместить объявление
          </v-btn>
          <v-btn
            v-if="variant === 'compact'"
            variant="outlined"
            color="primary"
            class="gv-cta"
            rounded="lg"
            @click="openPlaceListing"
          >
            Разместить объявление
          </v-btn>
          <template v-if="user">
            <v-btn
              :to="user.roles?.includes('admin') ? '/admin' : '/cabinet'"
              color="primary"
              class="gv-cta"
              rounded="lg"
            >
              Кабинет
            </v-btn>
            <v-avatar size="40" class="gv-header__avatar" color="grey-lighten-3">
              <span class="text-caption text-medium-emphasis">
                {{ (user.fullName || user.email || "?").slice(0, 1).toUpperCase() }}
              </span>
            </v-avatar>
          </template>
          <template v-else>
            <v-btn to="/auth" color="primary" class="gv-cta" rounded="lg">
              Войти
            </v-btn>
          </template>
        </div>
        <template #fallback>
          <div
            v-if="variant !== 'minimal'"
            class="gv-header__actions d-none d-md-flex gv-header__actions--placeholder"
            aria-hidden="true"
          />
        </template>
      </ClientOnly>

      <v-btn
        v-if="variant !== 'minimal'"
        class="d-md-none"
        icon
        variant="text"
        @click="isOpen = true"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </div>
  </header>

  <ClientOnly>
    <v-navigation-drawer v-model="isOpen" location="right" temporary width="280">
      <div class="pa-4">
        <div class="text-subtitle-1 font-weight-bold mb-3">Меню</div>
        <v-list density="comfortable">
          <v-list-item title="Каталог" @click="go('/listings')" />
          <v-list-item title="Разместить объявление" @click="openPlaceListing" />
          <v-divider class="my-2" />
          <v-list-item
            v-if="user"
            title="Кабинет"
            @click="go(user.roles?.includes('admin') ? '/admin' : '/cabinet')"
          />
          <v-list-item v-else title="Войти" @click="go('/auth')" />
        </v-list>
      </div>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<style scoped>
.gv-header {
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.gv-header__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.gv-header--marketing .gv-header__inner {
  padding: 20px 0;
}

.gv-header--minimal .gv-header__inner {
  padding: 16px 0;
}

.gv-header__brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.gv-header--compact .gv-header__brand {
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  flex: 0 1 auto;
}

.gv-header__logo {
  font-size: 22px;
  color: var(--gv-text);
  text-decoration: none;
  line-height: 1.2;
}

.gv-header--compact .gv-header__logo {
  font-size: 18px;
}

.gv-header--minimal .gv-header__logo {
  font-size: 18px;
}

.gv-header__tagline {
  margin: 0;
  font-size: 12px;
  color: var(--gv-text-muted);
}

.gv-header__catalog-note {
  font-size: 13px;
  color: var(--gv-text-muted);
}

.gv-header__actions {
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.gv-header--compact .gv-header__inner {
  justify-content: flex-start;
}

.gv-header--compact .gv-header__actions {
  margin-left: auto;
}

.gv-header__avatar {
  border: 1px solid #f0f0f0;
}

.gv-header__actions--placeholder {
  min-height: 48px;
  min-width: 120px;
}
</style>
