export interface Permission {
  // name: string;
  slug: string;
}

export interface Role {
  name: string;
  permissions: Permission[];
}

export interface AuthenticatedUser {
  id: string;
  roles: Role[];
  email: string;
  name: string;
}
