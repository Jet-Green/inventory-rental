<script setup lang="ts">
type ChipType = "booking" | "listing" | "verification";
type ChipColor = "warning" | "primary" | "success" | "error" | undefined;

const props = defineProps<{
  status: string;
  type: ChipType;
}>();

interface IChipMeta {
  label: string;
  color: ChipColor;
}

/** Карта статус → подпись/цвет по DESIGN_SPEC §2.5. */
const MAPS: Record<ChipType, Record<string, IChipMeta>> = {
  booking: {
    pending: { label: "Ожидает оплаты", color: "warning" },
    confirmed: { label: "Оплачено", color: "primary" },
    active: { label: "Активно", color: "success" },
    completed: { label: "Завершено", color: undefined },
    cancelled: { label: "Отменено", color: "error" },
  },
  listing: {
    draft: { label: "Черновик", color: undefined },
    pending: { label: "На модерации", color: "warning" },
    active: { label: "Опубликовано", color: "success" },
    rejected: { label: "Отклонено", color: "error" },
    hidden: { label: "Скрыто", color: undefined },
  },
  verification: {
    pending: { label: "На проверке", color: "warning" },
    approved: { label: "Подтверждена", color: "success" },
    rejected: { label: "Отклонена", color: "error" },
    none: { label: "Не отправлена", color: undefined },
  },
};

const meta = computed<IChipMeta>(
  () =>
    MAPS[props.type]?.[props.status] || {
      label: props.status,
      color: undefined,
    },
);
</script>

<template>
  <v-chip size="small" variant="tonal" :color="meta.color" class="gv-status-chip">
    {{ meta.label }}
  </v-chip>
</template>

<style scoped>
.gv-status-chip {
  font-size: 11px;
  font-weight: 500;
  text-transform: none;
}
</style>
