import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    JwtModule.register({}), // secrets are provided per-call in service
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    AccessJwtStrategy,
    RefreshJwtStrategy,
  ],
  exports: [],
})
export class AuthModule {}
