import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permission.enum';
import { Role } from '../enums/role.enum';
import { PERMISSIONS_KEY } from '../constants/metadata.keys';
import { roleHasAllPermissions } from '../utils/permissions.util';

/**
 * Permission guard (RBAC).
 *
 * Flow: JwtAuthGuard authenticates → this guard reads user.role from JWT payload
 * (attached as request.user) → checks ROLE_PERMISSIONS → allow or 403.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const role = user.role as Role;
    if (!role) {
      throw new ForbiddenException('User role is missing from token');
    }

    const allowed = roleHasAllPermissions(role, requiredPermissions);
    if (!allowed) {
      throw new ForbiddenException(
        `Access denied. Required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
