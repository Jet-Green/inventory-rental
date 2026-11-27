<script setup lang="ts">
import { rentalReturnPath } from "~/utils/rentalHandoff";
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: "login",
});

const route = useRoute();
const router = useRouter();
const returnPath = computed(() => rentalReturnPath(route.query.returnTo));
const auth = useAuth();

watch(
  () => route.query.businessNeedAuth,
  async (v) => {
    if (v !== "1") return;
    if (import.meta.server) return;
    await router.replace({ path: route.path, query: route.query.returnTo ? { returnTo: route.query.returnTo } : {} });
    await nextTick();
    toast("Войдите в аккаунт, чтобы открыть кабинет бизнеса.", {
      type: "warning",
      autoClose: 6000,
    });
  },
  { immediate: true },
);

const mode = ref<"login" | "registration">("login");
const isLoading = ref(false);
const errorMessage = ref("");

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  passwordRepeat: "",
});

async function submit() {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    if (mode.value === "login") {
      const ok = await auth.login(form.email, form.password);
      if (!ok) {
        return;
      }
    } else {
      if (form.password !== form.passwordRepeat) {
        errorMessage.value = "Пароли не совпадают";
        return;
      }
      const ok = await auth.registration({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (!ok) {
        return;
      }
    }

    await navigateTo(returnPath.value);
  } finally {
    isLoading.value = false;
  }
}

const isGorodaivesiLoading = ref(false);

async function gorodaivesiSubmit() {
  if (isGorodaivesiLoading.value) return;
  errorMessage.value = '';
  isGorodaivesiLoading.value = true;
  try {
    const result = await useNuxtApp().$apiFetch<{ url: string }>('/auth/federation/start', {
      method: 'POST', retry: 0, body: { returnPath: returnPath.value },
    });
    const target = new URL(result.url);
    if (target.origin !== 'https://gorodaivesi.ru' || target.pathname !== '/federation/authorize') throw new Error('Invalid destination');
    window.location.assign(target.href);
  } catch {
    errorMessage.value = 'Не удалось начать вход через «Города и Веси». Попробуйте ещё раз.';
    isGorodaivesiLoading.value = false;
  }
}

</script>

<template>
  <AccountPanel :title="mode === 'login' ? 'Вход в Аренду' : 'Регистрация'">
      <v-btn-toggle v-model="mode" mandatory class="auth-page__tabs">
        <v-btn value="login" class="action-btn">Вход</v-btn>
        <v-btn value="registration" class="action-btn">Регистрация</v-btn>
      </v-btn-toggle>

      <form class="auth-form" @submit.prevent="submit">
        <v-row dense>
          <v-col cols="12" v-if="mode === 'registration'">
            <v-text-field v-model="form.fullName" label="ФИО" autocomplete="name" />
          </v-col>
          <v-col cols="12" v-if="mode === 'registration'">
            <v-text-field v-model="form.phone" label="Телефон" autocomplete="tel" />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              autocomplete="username"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.password"
              label="Пароль"
              type="password"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            />
          </v-col>
          <v-col cols="12" v-if="mode === 'registration'">
            <v-text-field
              v-model="form.passwordRepeat"
              label="Повторите пароль"
              type="password"
              autocomplete="new-password"
            />
          </v-col>
        </v-row>

        <div v-if="errorMessage" class="text-error mb-3" role="alert">{{ errorMessage }}</div>

        <v-btn
          type="submit"
          color="primary"
          class="gv-cta"
          block
          size="large"
          :loading="isLoading"
        >
          {{ mode === "login" ? "Войти" : "Создать аккаунт" }}
        </v-btn>
      </form>

      <template v-if="!returnPath.startsWith('/federation/authorize')">
      <div class="auth-page__divider">
        <span>или</span>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        class="gv-cta auth-page__federation"
        block
        size="large"
        :loading="isGorodaivesiLoading"
        :disabled="isGorodaivesiLoading || isLoading"
        @click="gorodaivesiSubmit"
      >
        <img src="/gorodaivesi-logo.webp" alt="" width="48" height="36" class="auth-page__brand" />
        <span>Войти через «Города и Веси»</span>
      </v-btn>
      <p class="auth-page__hint">
        Вы перейдёте на gorodaivesi.ru для входа и вернётесь сюда.
      </p>
      </template>
  </AccountPanel>
</template>

<style scoped>
.auth-page__tabs { display: grid; grid-template-columns: 1fr 1fr; width: 100%; margin: 0 0 6px; padding: 3px; border-radius: 8px; background: #f3f1ed; }
.auth-page__tabs :deep(.v-btn) { height: 100%; font-size: 14px; background: transparent; }
.auth-page__tabs :deep(.v-btn--active) { background: white; box-shadow: 0 1px 4px #251e181c; }
.auth-page__tabs :deep(.v-btn--active .v-btn__overlay) { opacity: 0; }

.auth-page__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--gv-text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.auth-page__divider::before,
.auth-page__divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--gv-border-light);
}

.auth-page__hint {
  font-size: 12px;
  color: var(--gv-text-muted);
  line-height: 1.45;
}
</style>

<style scoped>
.auth-page__federation { height: auto !important; min-height: 48px; padding: 8px 12px; }
.auth-page__federation :deep(.v-btn__content) { white-space: normal; line-height: 1.35; gap: 8px; }
.auth-page__brand { object-fit: contain; flex-shrink: 0; }
</style>
