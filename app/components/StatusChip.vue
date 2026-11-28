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

/** Только статусы API: confirmed также выставляется владельцем без оплаты. */
const MAPS: Record<ChipType, Record<string, IChipMeta>> = {
  booking: {
    pending: { label: "Бронь создана", color: "warning" },
    confirmed: { label: "Бронь подтверждена", color: "primary" },
    active: { label: "Аренда началась", color: "success" },
    completed: { label: "Аренда завершена", color: undefined },
    cancelled: { label: "Бронь отменена", color: "error" },
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
    none: { label: "Заявка не отправлена", color: undefined },
  },
};

const meta = computed<IChipMeta>(
  () =>
    MAPS[props.type]?.[props.status] || {
      label: "Статус неизвестен",
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
