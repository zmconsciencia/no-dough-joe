import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    request.user = {
      id: 'e8a8a0b0-0d6d-4509-b5e1-edfef7bb6161',
      email: 'dev@mock.local',
      roles: ['admin'],
      permissions: ['profile:read', 'profile:edit'],
    };

    return true;
  }
}
