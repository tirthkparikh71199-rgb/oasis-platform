export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export function hasPermission(user: SessionUser, permission: string): boolean {
  return user.permissions.includes(permission) || user.roles.includes("SUPER_ADMIN");
}
