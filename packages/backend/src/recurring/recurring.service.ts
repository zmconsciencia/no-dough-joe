import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Recurrence } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { ExpenseService } from 'src/expense/expense.service';
import { Cron } from '@nestjs/schedule';

function atUTC(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
}
function nextWeekday(from: Date, weekday: number) {
  const cur = from.getUTCDay();
  const delta = (weekday - cur + 7) % 7 || 7;
  const n = new Date(from);
  n.setUTCDate(n.getUTCDate() + delta);
  return atUTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}
function clampDay(year: number, month: number, day: number) {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(day, last);
}
function nextMonthly(from: Date, day: number) {
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth() + 1;
  const d = clampDay(y, m, day);
  return atUTC(y, m, d);
}
function nextYearly(from: Date, month: number, day: number) {
  const y = from.getUTCFullYear() + 1;
  const d = clampDay(y, month, day);
  return atUTC(y, month, d);
}

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);
  constructor(
    private prisma: PrismaService,
    private expenses: ExpenseService,
  ) {}

  async list(userId: string) {
    return this.prisma.recurringSeries.findMany({
      where: { userId, isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    input: {
      categoryId: string;
      recurrence: Recurrence;
      amount: number;
      startDate: Date;
      endDate?: Date;
      dayOfMonth?: number;
      weekday?: number;
      note?: string;
    },
  ) {
    if (
      typeof input.amount !== 'number' ||
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new BadRequestException('amount must be a positive number');
    }

    const startDay = new Date(
      Date.UTC(
        input.startDate.getUTCFullYear(),
        input.startDate.getUTCMonth(),
        input.startDate.getUTCDate(),
      ),
    );
    const next = this.computeNext(startDay, {
      recurrence: input.recurrence,
      dayOfMonth: input.dayOfMonth ?? null,
      weekday: input.weekday ?? null,
      startDate: startDay,
    });

    const series = await this.prisma.recurringSeries.create({
      data: {
        userId,
        categoryId: input.categoryId,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(input.amount.toString()),
        recurrence: input.recurrence,
        dayOfMonth: input.dayOfMonth ?? null,
        weekday: input.weekday ?? null,
        startDate: startDay,
        endDate: input.endDate ?? null,
        note: input.note ?? null,
        isActive: true,
        nextRunAt: next,
      },
    });
    return series;
  }

  async deactivate(userId: string, id: string) {
    const s = await this.prisma.recurringSeries.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!s) throw new BadRequestException('not found');
    await this.prisma.recurringSeries.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private computeNext(
    from: Date,
    s: {
      recurrence: Recurrence;
      dayOfMonth: number | null;
      weekday: number | null;
      startDate: Date;
    },
  ) {
    switch (s.recurrence) {
      case 'DAILY': {
        const n = new Date(
          Date.UTC(
            from.getUTCFullYear(),
            from.getUTCMonth(),
            from.getUTCDate() + 1,
          ),
        );
        return n;
      }
      case 'WEEKLY': {
        const wd = s.weekday ?? s.startDate.getUTCDay();
        return nextWeekday(from, wd);
      }
      case 'MONTHLY': {
        const day = s.dayOfMonth ?? s.startDate.getUTCDate();
        return nextMonthly(from, day);
      }
      case 'YEARLY': {
        const m = s.startDate.getUTCMonth();
        const d = s.startDate.getUTCDate();
        return nextYearly(from, m, d);
      }
      default:
        return null;
    }
  }

  /**
   * Create expenses for all series due on (or before) the given date.
   * Idempotent per series/day: we check for an existing expense with same date & series.
   */
  async materializeDueForDate(userId: string, today: Date) {
    const startOfToday = atUTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    const due = await this.prisma.recurringSeries.findMany({
      where: {
        userId,
        isActive: true,
        nextRunAt: { lte: startOfToday },
        OR: [{ endDate: null }, { endDate: { gte: startOfToday } }],
      },
    });

    const created: string[] = [];
    for (const s of due) {
      const existing = await this.prisma.expense.findFirst({
        where: {
          userId,
          recurringSeriesId: s.id,
          date: startOfToday,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!existing) {
        const exp = await this.expenses.createExpenseWithAutoSplit({
          userId,
          categoryId: s.categoryId,
          date: startOfToday,
          amount: Number(s.amount),
          description: s.note ?? '',
          recurringSeriesId: s.id,
        });
        created.push(exp.id);
      }

      // schedule next occurrence
      const next = this.computeNext(startOfToday, s);
      await this.prisma.recurringSeries.update({
        where: { id: s.id },
        data: { nextRunAt: next },
      });
    }
    return created;
  }

  // Runs daily at 02:05 UTC
  @Cron('5 2 * * *')
  async cronMaterializeAllUsers() {
    this.logger.log('Recurring materializer tick');
    // For scale you'd page users; for now, iterate distinct users with active series
    const users = await this.prisma.recurringSeries.findMany({
      where: { isActive: true },
      select: { userId: true },
      distinct: ['userId'],
    });
    const today = new Date();
    for (const u of users) {
      try {
        const created = await this.materializeDueForDate(u.userId, today);
        if (created.length)
          this.logger.log(
            `User ${u.userId}: created ${created.length} expenses`,
          );
      } catch (e) {
        this.logger.error(
          `Materialize failed for user ${u.userId}: ${String(e)}`,
        );
      }
    }
  }
}
