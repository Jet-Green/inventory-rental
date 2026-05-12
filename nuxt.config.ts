import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

/** База для `$apiFetch`: обязан заканчиваться на `/api` (глобальный префикс Nest). */
function normalizePublicApiBase(raw: string | undefined): string {
  const fallback = "http://localhost:4000/api";
  const trimmed = (raw?.trim() || fallback).replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/styles/main.scss"],
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error injected by module hook
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@pinia/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Montserrat: [300, 400, 500, 600, 700, 800, 900],
          Nunito: [600, 700, 800, 900],
        },
        display: "swap",
      },
    ],
  ],
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    optimizeDeps: {
      include: ["dayjs"],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: normalizePublicApiBase(process.env.NUXT_PUBLIC_API_BASE),
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3068",
    },
  },
  devServer: {
    port: 3068,
  },
  app: {
    head: {
      title: "Аренда инвентаря",
      meta: [
        {
          name: "description",
          content:
            "Сервис аренды инвентаря: спорт, детям, для ОВЗ и походы. Бронирование онлайн с календарем доступности.",
        },
      ],
    },
    // out-in оставлял старую страницу до конца анимации и при смене layout + Vuetify давал «зависший» вид
    pageTransition: { name: "page" },
  },
  routeRules: {
    "/cabinet/renter": { redirect: "/renter-cabinet/rentals" },
    "/cabinet/renter/rentals": { redirect: "/renter-cabinet/rentals" },
    "/cabinet/renter/documents": { redirect: "/renter-cabinet/documents" },
    "/cabinet/renter/notifications": { redirect: "/renter-cabinet/notifications" },
    "/cabinet/renter/verification": { redirect: "/renter-cabinet/verification" },
    "/cabinet/renter/profile": { redirect: "/renter-cabinet/profile" },
    "/cabinet/business": { redirect: "/business-cabinet" },
    "/cabinet/business/listings": { redirect: "/business-cabinet/listings" },
    "/cabinet/business/listings/new": { redirect: "/business-cabinet/listings/new" },
    "/cabinet/business/bookings": { redirect: "/business-cabinet/bookings" },
    "/cabinet/business/calendar": { redirect: "/business-cabinet/calendar" },
    "/cabinet/business/payouts": { redirect: "/business-cabinet/payouts" },
    "/cabinet/business/documents": { redirect: "/business-cabinet/documents" },
    "/cabinet/business/verification": { redirect: "/business-cabinet/verification" },
    "/cabinet/business/profile": { redirect: "/business-cabinet/profile" },
    "/cabinet/rentals": { redirect: "/renter-cabinet/rentals" },
    "/cabinet/documents": { redirect: "/renter-cabinet/documents" },
    "/cabinet/notifications": { redirect: "/renter-cabinet/notifications" },
    "/cabinet/verification": { redirect: "/renter-cabinet/verification" },
    "/cabinet/profile": { redirect: "/renter-cabinet/profile" },
    "/cabinet/listings/new": { redirect: "/business-cabinet/listings/new" },
    "/cabinet/listings": { redirect: "/business-cabinet/listings" },
    "/cabinet/lessor-bookings": { redirect: "/business-cabinet/bookings" },
    "/cabinet/lessor-calendar": { redirect: "/business-cabinet/calendar" },
    "/cabinet/lessor-payouts": { redirect: "/business-cabinet/payouts" },
    "/cabinet/lessor-documents": { redirect: "/business-cabinet/documents" },
    "/cabinet/verification-lessor": { redirect: "/business-cabinet/verification" },
  },
});
