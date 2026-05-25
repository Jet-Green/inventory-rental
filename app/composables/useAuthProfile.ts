import OrganizationApi, {
  type ISubmitOrganizationVerificationPayload,
} from "~/api/OrganizationApi";
import UserApi, { type IUpdateProfilePayload } from "~/api/UserApi";
import type { IOrganization, IUserProfile } from "~/types/rental";

export function useAuthProfile() {
  const auth = useAuth();
  const profile = computed<IUserProfile | null>(() => auth.user);
  const isLoading = useState<boolean>("auth-profile-loading", () => false);

  async function fetchProfile(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await UserApi.me();
      auth.setUser(response.user);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(payload: IUpdateProfilePayload): Promise<void> {
    const response = await UserApi.update(payload);
    auth.setUser(response.user);
  }

  /** Создаёт/обновляет organizations и ставит заявку на модерацию. */
  async function submitOrganizationVerification(
    payload: ISubmitOrganizationVerificationPayload,
  ): Promise<IOrganization> {
    const { organization } = await OrganizationApi.submitVerification(payload);
    const { organization: orgState, fetchMine } = useMyOrganization();
    if (organization) {
      orgState.value = organization;
    } else {
      await fetchMine();
    }
    return orgState.value as IOrganization;
  }

  async function verifyRenter(): Promise<void> {
    const response = await UserApi.verifyRenter();
    auth.setUser(response.user);
  }

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    submitOrganizationVerification,
    verifyRenter,
  };
}
