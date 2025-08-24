import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, SourceKind } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

function firstOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function startEndOfMonth(monthISO: string) {
  const from = new Date(monthISO);
  const to = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1),
  );
  return { from, to };
}

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async mealTicketAvailable(userId: string, asOf: Date) {
    const topUps = await this.prisma.mealTicketTopUp.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        date: {
          lte: firstOfMonthUTC(asOf) <= asOf ? firstOfMonthUTC(asOf) : asOf,
        },
      },
    });
    const used = await this.prisma.expenseAllocation.aggregate({
      _sum: { amount: true },
      where: {
        source: SourceKind.MEAL_TICKET,
        expense: { userId, date: { lte: asOf }, deletedAt: null },
      },
    });
    const t = Number(topUps._sum.amount ?? 0);
    const u = Number(used._sum.amount ?? 0);
    return Math.max(0, +(t - u).toFixed(2));
  }

  async createExpenseWithAutoSplit(input: {
    userId: string;
    categoryId: string;
    date: Date;
    amount: number;
    description?: string;
    recurringSeriesId?: string | null;
    payWithMealTicket?: boolean;
  }) {
    const amount = new Prisma.Decimal(input.amount.toString());

    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found');

    const useTicket =
      !!input.payWithMealTicket && category.eligibleForMealTicket;
    let mtPart = new Prisma.Decimal(0);
    let cashPart = amount;

    if (useTicket) {
      const available = await this.mealTicketAvailable(
        input.userId,
        input.date,
      );
      const availDec = new Prisma.Decimal(available.toString());
      mtPart = Prisma.Decimal.min(availDec, amount);
      cashPart = amount.minus(mtPart);
    }

    const expense = await this.prisma.expense.create({
      data: {
        userId: input.userId,
        categoryId: input.categoryId,
        date: input.date,
        amount,
        description: input.description ?? '',
        recurringSeriesId: input.recurringSeriesId ?? null,
        allocations: {
          create: [
            ...(mtPart.greaterThan(0)
              ? [{ source: 'MEAL_TICKET' as const, amount: mtPart }]
              : []),
            ...(cashPart.greaterThan(0)
              ? [{ source: 'CASH' as const, amount: cashPart }]
              : []),
          ],
        },
      },
      include: { allocations: true, category: true },
    });

    return expense;
  }

  async softDelete(userId: string, expenseId: string) {
    const exp = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId, deletedAt: null },
    });
    if (!exp) throw new BadRequestException('not found');
    await this.prisma.expense.update({
      where: { id: exp.id },
      data: { deletedAt: new Date() },
    });
  }

  async listForMonth(userId: string, monthISO: string) {
    const { from, to } = startEndOfMonth(monthISO);
    return this.prisma.expense.findMany({
      where: { userId, date: { gte: from, lt: to }, deletedAt: null },
      include: { allocations: true, category: true },
      orderBy: { date: 'asc' },
    });
  }

  async allocationSummaryForMonth(userId: string, monthISO: string) {
    const { from, to } = startEndOfMonth(monthISO);
    const rows = await this.prisma.expenseAllocation.groupBy({
      by: ['source'],
      _sum: { amount: true },
      where: {
        expense: { userId, date: { gte: from, lt: to }, deletedAt: null },
      },
    });
    return rows.map((r) => ({
      source: r.source,
      total: Number(r._sum.amount ?? 0),
    }));
  }

  async categorySummaryForMonth(userId: string, monthISO: string) {
    const { from, to } = startEndOfMonth(monthISO);
    const rows = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { userId, date: { gte: from, lt: to }, deletedAt: null },
    });
    const categories = await this.prisma.category.findMany({
      where: { id: { in: rows.map((r) => r.categoryId) } },
      select: { id: true, name: true, color: true },
    });
    const cmap = new Map(categories.map((c) => [c.id, c]));
    return rows.map((r) => ({
      categoryId: r.categoryId,
      name: cmap.get(r.categoryId)?.name ?? 'Unknown',
      color: cmap.get(r.categoryId)?.color ?? '#999',
      total: Number(r._sum.amount ?? 0),
    }));
  }
}
