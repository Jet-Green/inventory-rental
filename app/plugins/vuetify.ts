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
            secondary: "#23afd6",
            info: "#1c8caa",
            success: "#bcc662",
            warning: "#e8a33d",
            error: "#d5442c",
            background: "#fffdf6",
            surface: "#ffffff",
          },
          variables: {
            "border-radius-root": "4px",
          },
        },
      },
    },
    ssr: true,
  });

  nuxtApp.vueApp.use(vuetify);
});
