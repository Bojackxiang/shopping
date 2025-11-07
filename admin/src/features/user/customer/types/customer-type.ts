interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl?: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  createdAt: number;
  updatedAt: number;
  lastSignInAt?: number;
  publicMetadata?: {
    role?: string;
  };
}

export interface CustomerResponse {
  data: Customer[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
