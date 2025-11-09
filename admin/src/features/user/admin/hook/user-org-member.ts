import { useApi } from '@/hooks/use-api';

export interface OrgMemberListParams {
  limit?: number;
  offset?: number;
  query?: string;
  orderBy?: string;
  enabled?: boolean;
}

export const useOrgMemberList = (params: OrgMemberListParams = {}) => {
  const { enabled = true } = params;

  const url = enabled ? `/api/org` : null;

  return useApi(url, {
    revalidateOnMount: true,
    dedupingInterval: 5 * 60 * 1000
  });
};
