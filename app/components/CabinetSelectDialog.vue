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
    <v-card rounded="xl" class="pa-2">
      <v-card-title class="gv-display text-h6 pb-2">
        Выберите кабинет
      </v-card-title>
      <v-card-text class="text-body-2 text-medium-emphasis pb-4">
        Один аккаунт: личный кабинет для аренды и отдельный кабинет бизнеса для объявлений.
        Переключайтесь в любой момент.
      </v-card-text>

      <v-card-text class="pt-0">
        <v-row class="ga-4">
          <v-col cols="12" sm="6">
            <div class="gv-card-elevated pa-5 h-100 d-flex flex-column rounded-lg">
              <h3 class="gv-display text-subtitle-1 mb-2">Личный кабинет</h3>
              <p class="text-body-2 text-medium-emphasis mb-4 flex-grow-1">
                Бронируйте технику, следите за заказами и документами.
              </p>
              <v-btn
                color="primary"
                block
                class="gv-cta"
                rounded="lg"
                @click="goPersonalCabinet"
              >
                Войти
              </v-btn>
              <p v-if="!isRenter && !isAdmin" class="text-caption text-medium-emphasis mt-2 mb-0">
                Доступно после регистрации.
              </p>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="gv-card-elevated pa-5 h-100 d-flex flex-column rounded-lg">
              <h3 class="gv-display text-subtitle-1 mb-2">Кабинет бизнеса</h3>
              <p class="text-body-2 text-medium-emphasis mb-4 flex-grow-1">
                Объявления, брони и выплаты как компания или ИП.
              </p>
              <v-btn
                color="primary"
                block
                class="gv-cta"
                rounded="lg"
                @click="goBusinessCabinet"
              >
                Войти
              </v-btn>
              <p v-if="!isBusiness && !isAdmin" class="text-caption text-medium-emphasis mt-2 mb-0">
                Нужна верификация бизнеса.
              </p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end px-4 pb-4 pt-0">
        <v-btn variant="text" rounded="lg" @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
