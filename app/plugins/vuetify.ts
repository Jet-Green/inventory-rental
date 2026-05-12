import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { ru } from "vuetify/locale";
import DayJsAdapter from "@date-io/dayjs";
import "dayjs/locale/ru";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    locale: {
      locale: "ru",
      messages: { ru },
    },
    date: {
      adapter: DayJsAdapter,
    },
    defaults: {
      global: {
        ripple: false,
      },
      VBtn: {
        style: "text-transform: none; letter-spacing: normal;",
      },
    },
    theme: {
      themes: {
        light: {
          dark: false,
          colors: {
            primary: "#ff6600",
            secondary: "#1f2937",
            background: "#ffffff",
            surface: "#ffffff",
          },
        },
      },
    },
    ssr: true,
  });

  nuxtApp.vueApp.use(vuetify);
});
