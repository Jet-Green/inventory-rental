<script setup lang="ts">
import { toast } from "vue3-toastify";

definePageMeta({
  middleware: "login",
});

const route = useRoute();
const router = useRouter();
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

    await navigateTo("/cabinet");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="page-container py-6">
    <h1 class="section-title mb-4">Локальная авторизация</h1>
    <v-card class="pa-4" rounded="lg">
      <v-btn-toggle v-model="mode" mandatory class="mb-4">
        <v-btn value="login">Вход</v-btn>
        <v-btn value="registration">Регистрация</v-btn>
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

        <v-btn type="submit" color="primary" class="action-btn" :loading="isLoading">
          {{ mode === "login" ? "Войти" : "Создать аккаунт" }}
        </v-btn>
      </form>
    </v-card>
  </section>
</template>
