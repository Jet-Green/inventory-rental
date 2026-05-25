import { toast } from "vue3-toastify";
import { isAuthApiUrl, isProtectedRoutePath } from "~/utils/auth-routes";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: "include",
    retry: 1,
    onRequest({ options }) {
      // На сервере $fetch не подставляет cookie браузера — без этого refresh/login падают,
      // middleware шлёт на /auth, а на клиенте сессия есть → лишний редирект и hydration mismatch.
      if (import.meta.server) {
        const incoming = useRequestHeaders(["cookie"]);
        if (incoming.cookie) {
          options.headers = {
            ...(options.headers as Record<string, string>),
            cookie: incoming.cookie,
          };
        }
      }
    },
    onResponseError({ response }) {
      const status = response?.status;
      const url = response.url || "";
      const isAuthCall = isAuthApiUrl(url);

      // Гость на главной: refresh даёт 401 «Нужна авторизация» — не показываем toast.
      if (import.meta.client && status !== 401) {
        const message = response?._data?.message;
        if (message) {
          toast(String(message), { type: "error" });
        }
      }

      if (import.meta.client && status === 401 && !isAuthCall) {
        const route = useRoute();
        if (route.path !== "/auth" && isProtectedRoutePath(route.path)) {
          navigateTo("/auth");
        }
      }
    },
  });

  return {
    provide: {
      apiFetch,
    },
  };
});
