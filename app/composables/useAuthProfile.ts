import UserApi, { type IUpdateProfilePayload } from "~/api/UserApi";
import type { IUserProfile } from "~/types/rental";

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

  async function requestBusinessVerification(): Promise<void> {
    const response = await UserApi.requestBusinessVerification();
    auth.setUser(response.user);
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
    requestBusinessVerification,
    verifyRenter,
  };
}
