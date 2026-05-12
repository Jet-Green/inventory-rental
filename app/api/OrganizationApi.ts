import type { IOrganization, LegalStatus } from "~/types/rental";

export interface ISubmitOrganizationVerificationPayload {
  legalStatus: LegalStatus;
  inn: string;
  ogrnOrOgrnip: string;
  companyName: string;
  payoutPhone: string;
}

export default {
  async mine(): Promise<{ organization: IOrganization | null }> {
    /* Основной путь — `/user/*`: тот же хост, что и `user/me`, без отдельного префикса `organization`. */
    return useNuxtApp().$apiFetch("/user/my-organization", {
      method: "GET",
    });
  },

  async submitVerification(
    payload: ISubmitOrganizationVerificationPayload,
  ): Promise<{ organization: unknown }> {
    return useNuxtApp().$apiFetch("/user/submit-organization-verification", {
      method: "POST",
      body: payload,
    });
  },
};
