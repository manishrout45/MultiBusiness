import { Role } from './role.enum';
import { Permission } from './permission.enum';

/**
 * Role → permission matrix.
 * SUPER_ADMIN covers the platform "ADMIN" capabilities from the RBAC requirements.
 * Extend this map when adding roles or permissions — guards stay unchanged.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.CUSTOMER]: [
    Permission.PRODUCT_VIEW,
    Permission.ORDER_CREATE,
  ],

  [Role.VENDOR]: [
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.BUSINESS_MANAGE,
    Permission.ORDER_VIEW_VENDOR,
  ],

  [Role.MANAGER]: [
    Permission.PRODUCT_VIEW,
    Permission.VENDOR_APPROVE,
    Permission.USER_MANAGE,
  ],

  [Role.SUPER_ADMIN]: [
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.ORDER_CREATE,
    Permission.ORDER_VIEW_VENDOR,
    Permission.BUSINESS_MANAGE,
    Permission.VENDOR_APPROVE,
    Permission.USER_MANAGE,
  ],
};
