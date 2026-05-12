import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 2000,
    position: "bottom-center",
    /* Не гасить тосты при каждом push/replace — иначе предупреждения после редиректа не видны. */
    clearOnUrlChange: false,
  });

  return {
    provide: {
      toast,
    },
  };
});
