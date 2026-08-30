/**
 * Granular permissions — assign to roles in ROLE_PERMISSIONS.
 * Add new permissions here as features grow; do not hard-code role checks in controllers.
 */
export enum Permission {
  PRODUCT_VIEW = 'product:view',
  PRODUCT_CREATE = 'product:create',

  ORDER_CREATE = 'order:create',
  ORDER_VIEW_VENDOR = 'order:view_vendor',

  BUSINESS_MANAGE = 'business:manage',

  VENDOR_APPROVE = 'vendor:approve',
  USER_MANAGE = 'user:manage',
}
