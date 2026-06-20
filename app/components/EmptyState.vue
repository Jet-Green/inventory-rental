<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    actionTitle?: string;
  }>(),
  {
    description: "",
    actionTitle: "",
  },
);

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="gv-empty pa-8 text-center">
    <div class="text-h6 font-weight-bold mb-2">{{ title }}</div>
    <div v-if="description" class="gv-empty__desc mb-5">{{ description }}</div>
    <v-btn
      v-if="actionTitle"
      color="primary"
      class="gv-cta"
      rounded="lg"
      @click="emit('action')"
    >
      {{ actionTitle }}
    </v-btn>
  </div>
</template>

<style scoped>
.gv-empty {
  background: var(--gv-card-bg);
  border: 1px dashed var(--gv-border);
  border-radius: var(--gv-radius-card);
}

.gv-empty__desc {
  font-size: 14px;
  color: var(--gv-text-secondary);
}
</style>
