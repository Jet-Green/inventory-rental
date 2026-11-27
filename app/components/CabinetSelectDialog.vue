<script setup lang="ts">
const { isOpen, close, ensureOrgLoaded } = useCabinetSelectDialog();
const { isBusiness, isRenter, isAdmin } = useRole();

watch(isOpen, async (v) => {
  if (v) await ensureOrgLoaded();
});

function goPersonalCabinet(): void {
  close();
  void navigateTo("/renter-cabinet/rentals");
}

function goBusinessCabinet(): void {
  close();
  if (isBusiness.value || isAdmin.value) {
    void navigateTo("/business-cabinet");
  } else {
    void navigateTo("/business-cabinet/verification");
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="560" scrollable>
    <v-card class="pa-2 gv-modal">
      <v-card-title class="gv-display text-h6 pb-2">
        Выберите кабинет
      </v-card-title>
      <v-card-text class="cabinet-options">
        <button class="cabinet-option" type="button" @click="goPersonalCabinet">
          <v-icon icon="mdi-account-outline" aria-hidden="true" />
          <span><strong>Личный кабинет</strong><small>Мои аренды и документы</small>
            <small v-if="!isRenter && !isAdmin">Доступно после регистрации.</small></span>
          <v-icon icon="mdi-chevron-right" aria-hidden="true" />
        </button>
        <button class="cabinet-option" type="button" @click="goBusinessCabinet">
          <v-icon icon="mdi-store-outline" aria-hidden="true" />
          <span><strong>Кабинет бизнеса</strong><small>Объявления, брони и выплаты</small>
            <small v-if="!isBusiness && !isAdmin">Нужна верификация бизнеса.</small></span>
          <v-icon icon="mdi-chevron-right" aria-hidden="true" />
        </button>
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4 pt-0">
        <v-btn variant="text" class="action-btn" @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cabinet-options { display: grid; gap: 10px; }
.cabinet-option { display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 14px; align-items: center; width: 100%; padding: 16px; text-align: left; color: var(--gv-text); border: 1px solid var(--gv-border-light); border-radius: 10px; }
.cabinet-option:hover, .cabinet-option:focus-visible { background: #f3fafb; border-color: var(--gv-sign-dark); }
.cabinet-option > .v-icon { color: #18738a; }
.cabinet-option strong, .cabinet-option small { display: block; }
.cabinet-option small { margin-top: 4px; line-height: 1.45; color: var(--gv-text-secondary); }
</style>
