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
  <section class="auth-page page-container py-8">
    <span class="gv-sign-eyebrow mb-3">Аккаунт</span>
    <h1 class="section-title mb-2">{{ mode === "login" ? "Вход" : "Регистрация" }}</h1>
    <p class="text-muted mb-4 auth-page__lead">
      Войдите в аккаунт «Аренда инвентаря» или используйте вход через «Города и Веси».
    </p>
    <v-card class="pa-4 pa-sm-6 gv-card-elevated auth-page__card" flat>
      <v-btn-toggle v-model="mode" mandatory class="mb-4">
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
      <div class="auth-page__divider my-5">
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
      <p class="auth-page__hint mt-2">
        Вы перейдёте на gorodaivesi.ru для входа и вернётесь сюда.
      </p>
      </template>
    </v-card>
  </section>
</template>

<style scoped>
.auth-page__card {
  max-width: 460px;
}

.auth-page__lead {
  max-width: 460px;
  font-size: 14px;
}

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
