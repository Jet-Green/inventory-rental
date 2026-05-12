import { defineStore } from "pinia";
import AuthApi from "~/api/AuthApi";
import type { IUserProfile } from "~/types/rental";

export const useAuth = defineStore("auth", () => {
  const user = ref<IUserProfile | null>(null);
  const isChecking = ref(false);
  let checkAuthPromise: Promise<boolean> | null = null;

  async function registration(payload: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<boolean> {
    try {
      const response = await AuthApi.registration(payload);
      user.value = response.user;
      return true;
    } catch {
      return false;
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await AuthApi.login(email, password);
      user.value = response.user;
      return true;
    } catch {
      return false;
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (checkAuthPromise) {
      return checkAuthPromise;
    }
    checkAuthPromise = (async () => {
      try {
        isChecking.value = true;
        if (user.value?._id) {
          return true;
        }
        const response = await AuthApi.refresh();
        user.value = response || null;
        return !!response?._id;
      } catch {
        user.value = null;
        return false;
      } finally {
        isChecking.value = false;
        checkAuthPromise = null;
      }
    })();
    return checkAuthPromise;
  }

  function setUser(nextUser: IUserProfile | null): void {
    user.value = nextUser;
  }

  async function logout(): Promise<void> {
    try {
      await AuthApi.logout();
    } catch {}
    user.value = null;
    await navigateTo("/");
  }

  return {
    user,
    isChecking,
    registration,
    login,
    checkAuth,
    setUser,
    logout,
  };
});
