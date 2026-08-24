import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY } from '../constants/metadata.keys';

/**
 * Require all listed permissions (AND).
 * User role is resolved from JWT → request.user.role after JwtAuthGuard.
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
