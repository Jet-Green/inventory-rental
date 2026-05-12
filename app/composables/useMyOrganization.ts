import OrganizationApi from "~/api/OrganizationApi";
import type { IOrganization } from "~/types/rental";

export function useMyOrganization() {
  const organization = useState<IOrganization | null>("my-organization", () => null);

  async function fetchMine(): Promise<void> {
    const { organization: org } = await OrganizationApi.mine();
    organization.value = org;
  }

  return { organization, fetchMine };
}
