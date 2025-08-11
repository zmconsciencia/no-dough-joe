import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ParseIntPipe } from '@nestjs/common';
import { MealTicketService } from './mealticket.service';

class CreateTopUpDto {
  @IsString()
  month!: string; // 'YYYY-MM' or any date within the month

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller('api/mealticket')
export class MealTicketController {
  constructor(private readonly mtService: MealTicketService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTopUpDto) {
    const user = req.user as { id: string };
    return this.mtService.createTopUp(user.id, dto.month, dto.amount, dto.note);
  }

  // summary: [{ month: ISO first-of-month, total: number }, ...]
  @Get('summary')
  async summary(
    @Req() req: Request,
    @Query('from') from: string,
    @Query('months', ParseIntPipe) months: number,
  ) {
    const user = req.user as { id: string };
    return this.mtService.monthlySummary(user.id, from, months);
  }
}
