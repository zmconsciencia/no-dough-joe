import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { RecurringService } from './recurring.service';
import { IsDateString, IsDefined, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Recurrence } from '@prisma/client';

class CreateRecurringDto {
  @IsUUID()
  categoryId!: string;

  @IsEnum(Recurrence)
  recurrence!: Recurrence;

  @IsDefined()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weekday?: number;

  @IsOptional()
  note?: string;
}

@Controller('api/recurring')
export class RecurringController {
  constructor(private readonly svc: RecurringService) {}

  @Get()
  async list(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.svc.list(user.id);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateRecurringDto) {
    const user = req.user as { id: string };
    return this.svc.create(user.id, {
      categoryId: dto.categoryId,
      recurrence: dto.recurrence,
      amount: dto.amount,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      dayOfMonth: dto.dayOfMonth,
      weekday: dto.weekday,
      note: dto.note,
    });
  }

  @Delete(':id')
  async deactivate(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
    const user = req.user as { id: string };
    await this.svc.deactivate(user.id, id);
    return { ok: true };
  }

  @Post('run-today')
  async runToday(@Req() req: Request) {
    const user = req.user as { id: string };
    const out = await this.svc.materializeDueForDate(user.id, new Date());
    return { created: out.length };
  }
}
