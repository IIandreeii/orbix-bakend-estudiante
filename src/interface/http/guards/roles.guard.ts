import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../core/domain/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Roles hierarchy: higher role includes lower role permissions
  private readonly rolesPriority: Record<Role, number> = {
    [Role.MASTER]: 4,
    [Role.SUPERMASTER]: 3,
    [Role.ADMIN]: 2,
    [Role.ADVISER]: 1,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user?: { role?: Role };
    }>();

    if (!user || !user.role) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Check if the user has at least one of the required roles or a superior one
    const userPriority = this.rolesPriority[user.role] ?? 0;

    const hasPermission = requiredRoles.some((role) => {
      const targetPriority = this.rolesPriority[role] ?? 0;
      return userPriority >= targetPriority;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions for this resource',
      );
    }

    return true;
  }
}
