import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

function toMonthStart(input: string | Date): Date {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid month');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}
function addMonths(d: Date, n: number): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 0, 0, 0, 0),
  );
}

@Injectable()
export class MealTicketService {
  constructor(private readonly prisma: PrismaService) {}

  async createTopUp(
    userId: string,
    monthStr: string,
    amount: number,
    note?: string,
  ) {
    const date = toMonthStart(monthStr);
    return this.prisma.mealTicketTopUp.upsert({
      where: { userId_month: { userId, date } },
      update: { amount, note },
      create: { userId, date, amount, note },
    });
  }

  async monthlySummary(userId: string, fromStr: string, months: number) {
    const from = toMonthStart(fromStr);
    const to = addMonths(from, months);

    const rows = await this.prisma.$queryRaw<{ month: Date; total: number }[]>(
      Prisma.sql`
        SELECT date_trunc('month', "date") AS month,
               COALESCE(SUM("amount"), 0)   AS total
        FROM "MealTicketTopUp"
        WHERE "userId" = ${userId}
          AND "date" >= ${from}
          AND "date" < ${to}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    );

    const map = new Map<string, number>();
    rows.forEach((r) =>
      map.set(new Date(r.month).toISOString(), Number(r.total)),
    );

    const result: { month: string; total: number }[] = [];
    for (let i = 0; i < months; i++) {
      const m = addMonths(from, i);
      const k = m.toISOString();
      result.push({ month: k, total: map.get(k) ?? 0 });
    }
    return result;
  }
}
