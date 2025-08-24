import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Query, Req, Post } from '@nestjs/common';
import type { Request } from 'express';
import { ExpenseService } from './expense.service';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

class CreateExpenseDto {
  @IsUUID()
  categoryId!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  recurringSeriesId?: string;

  @IsOptional()
  payWithMealTicket?: boolean;
}

@Controller('api/expenses')
export class ExpenseController {
  constructor(private readonly expenses: ExpenseService) {}

  @Get()
  async listByMonth(
    @Req() req: Request,
    @Query('month') monthISO: string,
  ) {
    const user = req.user as { id: string };
    return this.expenses.listForMonth(user.id, monthISO);
  }

  @Delete(':id')
  async softDelete(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
    const user = req.user as { id: string };
    await this.expenses.softDelete(user.id, id);
    return { ok: true };
  }

  @Get('balance/mealticket')
  async mealTicketBalance(@Req() req: Request, @Query('asOf') asOf: string) {
    const user = req.user as { id: string };
    return { available: await this.expenses.mealTicketAvailable(user.id, new Date(asOf)) };
  }

  @Get('allocation/summary')
  async allocationSummary(@Req() req: Request, @Query('month') monthISO: string) {
    const user = req.user as { id: string };
    return this.expenses.allocationSummaryForMonth(user.id, monthISO);
  }

  @Get('category/summary')
  async categorySummary(@Req() req: Request, @Query('month') monthISO: string) {
    const user = req.user as { id: string };
    return this.expenses.categorySummaryForMonth(user.id, monthISO);
  }

  @Get('one')
  async createOne(@Req() req: Request, @Query() q: CreateExpenseDto) {
    const user = req.user as { id: string };
    return this.expenses.createExpenseWithAutoSplit({
      userId: user.id,
      categoryId: q.categoryId,
      date: new Date(q.date),
      amount: q.amount,
      description: q.description,
      recurringSeriesId: q.recurringSeriesId,
    });
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateExpenseDto) {
    const user = req.user as { id: string };
    return this.expenses.createExpenseWithAutoSplit({
      userId: user.id,
      categoryId: dto.categoryId,
      date: new Date(dto.date),
      amount: dto.amount,
      description: dto.description,
      recurringSeriesId: dto.recurringSeriesId,
      payWithMealTicket: dto.payWithMealTicket ?? false,
    });
  }
}
