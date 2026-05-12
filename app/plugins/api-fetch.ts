import { toast } from "vue3-toastify";

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
      const message = response?._data?.message;
      if (import.meta.client && message) {
        toast(String(message), { type: "error" });
      }

      if (import.meta.client && response?.status === 401) {
        const route = useRoute();
        const url = response.url || "";
        const isAuthCall =
          url.includes("/auth/login") ||
          url.includes("/auth/registration") ||
          url.includes("/auth/refresh") ||
          url.includes("/auth/logout");
        if (!isAuthCall && route.path !== "/auth") {
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
