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
  <v-card class="pa-6 text-center" rounded="lg" variant="tonal">
    <div class="text-h6 font-weight-bold mb-2">{{ title }}</div>
    <div v-if="description" class="text-muted mb-4">{{ description }}</div>
    <v-btn v-if="actionTitle" color="primary" class="action-btn" @click="emit('action')">
      {{ actionTitle }}
    </v-btn>
  </v-card>
</template>

