import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { PrismaService } from './common/prisma.service';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SalaryController } from './salary/salary.controller';
import { SalaryService } from './salary/salary.service';
import { BonusService } from './bonus/bonus.service';
import { BonusController } from './bonus/bonus.controller';
import { MealTicketController } from './mealticket/mealticket.controller';
import { MealTicketService } from './mealticket/mealticket.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AppController,
    UserController,
    SalaryController,
    BonusController,
    MealTicketController,
  ],
  providers: [
    AppService,
    UserService,
    PrismaService,
    SalaryService,
    BonusService,
    MealTicketService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
