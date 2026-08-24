import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function roleHasAllPermissions(
  role: Role,
  permissions: Permission[],
): boolean {
  if (permissions.length === 0) {
    return true;
  }
  const granted = new Set(getPermissionsForRole(role));
  return permissions.every((permission) => granted.has(permission));
}
