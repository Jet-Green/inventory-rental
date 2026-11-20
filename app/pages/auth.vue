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
    await router.replace({ path: route.path, query: {} });
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
  errorMessage.value = "";
  if (!form.email || !form.password) {
    errorMessage.value =
      "Введите email и пароль вашего аккаунта «Города и Веси».";
    return;
  }
  isGorodaivesiLoading.value = true;
  try {
    const ok = await auth.gorodaivesiLogin(form.email, form.password);
    if (!ok) {
      toast("Не удалось войти через «Города и Веси». Проверьте данные.", {
        type: "error",
        autoClose: 6000,
      });
      return;
    }
    await navigateTo(returnPath.value);
  } finally {
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

        <div v-if="errorMessage" class="text-error mb-3">{{ errorMessage }}</div>

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

      <div class="auth-page__divider my-5">
        <span>или</span>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        class="gv-cta"
        block
        size="large"
        :loading="isGorodaivesiLoading"
        @click="gorodaivesiSubmit"
      >
        <v-icon start>mdi-sign-direction</v-icon>
        Войти через «Города и Веси»
      </v-btn>
      <p class="auth-page__hint mt-2">
        Введите email и пароль вашего аккаунта на gorodaivesi.ru — мы создадим
        связанный профиль автоматически.
      </p>
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
