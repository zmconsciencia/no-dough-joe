import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';

function monthKey(input: string | Date): Date {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid date');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dateStr: string, amount: number, note?: string) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException('Invalid date');
    return this.prisma.bonusIncome.create({
      data: { userId, date, amount, note },
    });
  }

  /**
   * Returns totals per month from 'from' for N months (fills missing months with 0)
   */
  async monthlySummary(userId: string, fromStr: string, months: number) {
    const from = monthKey(fromStr);
    const to = addMonths(from, months); // exclusive upper bound

    // Aggregate bonuses by month using date_trunc
    const rows = await this.prisma.$queryRaw<
      { month: Date; total: number }[]
    >(Prisma.sql`
      SELECT date_trunc('month', "date") AS month,
             COALESCE(SUM("amount"), 0)    AS total
      FROM "BonusIncome"
      WHERE "userId" = ${userId}
        AND "date" >= ${from}
        AND "date" < ${to}
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    // Build a dense series of months with zeros for gaps
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
