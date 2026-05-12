<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { open } = useCabinetSelectDialog();

watch(
  () => route.fullPath,
  async () => {
    if (import.meta.server) return;
    const q = route.query;
    if (q.openCabinetSelect !== "1") return;

    await open({ businessAccessDenied: q.businessAccessDenied === "1" });

    const nextQuery: Record<string, string | string[] | undefined> = { ...route.query };
    delete nextQuery.openCabinetSelect;
    delete nextQuery.businessAccessDenied;

    const cleaned = Object.fromEntries(
      Object.entries(nextQuery).filter(([, v]) => v !== undefined && v !== ""),
    );

    await router.replace({
      path: route.path,
      ...(Object.keys(cleaned).length ? { query: cleaned } : {}),
    });
  },
  { immediate: true },
);
</script>

<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CabinetSelectDialog />
  </v-app>
</template>
