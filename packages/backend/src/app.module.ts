import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MockAuthGuard } from './common/guards/mock-auth-guards';
import { UserController } from './user/user.controller';
import { PrismaService } from './common/prisma.service';
import { UserService } from './user/user.service';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: MockAuthGuard,
    },
  ],
})
export class AppModule {}
