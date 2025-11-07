interface AdminUser {
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

export interface AdminUserResponse {
  data: AdminUser[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
