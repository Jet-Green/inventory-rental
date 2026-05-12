import { toast } from "vue3-toastify";

const CABINET_SELECT_OPEN = "cabinet-select-dialog-open";

export function useCabinetSelectDialog() {
  const isOpen = useState(CABINET_SELECT_OPEN, () => false);

  async function ensureOrgLoaded(): Promise<void> {
    const auth = useAuth();
    if (!auth.user?._id) return;
    const { fetchMine } = useMyOrganization();
    await fetchMine();
  }

  /**
   * Открыть выбор кабинета (арендатор / бизнес). Нужна авторизация — иначе редирект на /auth.
   */
  async function open(options?: { businessAccessDenied?: boolean }): Promise<void> {
    if (import.meta.server) return;

    const auth = useAuth();
    if (!auth.user?._id) {
      const ok = await auth.checkAuth();
      if (!ok) {
        await navigateTo("/auth");
        return;
      }
    }

    await ensureOrgLoaded();
    isOpen.value = true;

    if (options?.businessAccessDenied) {
      await nextTick();
      toast(
        "Кабинет бизнеса сейчас недоступен для этого аккаунта. Войдите под другим пользователем или выберите личный кабинет.",
        { type: "warning", autoClose: 6000 },
      );
    }
  }

  function close(): void {
    isOpen.value = false;
  }

  return { isOpen, open, close, ensureOrgLoaded };
}
