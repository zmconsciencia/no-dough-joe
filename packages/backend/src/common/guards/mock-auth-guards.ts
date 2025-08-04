import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    request.user = {
      id: '6a44edf6-a294-4ae9-9850-f8b541cf958b',
      email: 'dev@mock.local',
      roles: ['admin'],
      permissions: ['profile:read', 'profile:edit'],
    };

    return true;
  }
}
