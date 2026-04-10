import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const userId = request.headers['user-id'];

    if (!userId) {
      throw new ForbiddenException('User ID not provided in headers');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Attach user to request for further use (e.g., Re-BAC)
    request.user = user;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Role ${user.role} does not have access. Requires: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
