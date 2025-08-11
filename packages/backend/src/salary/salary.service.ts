import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

function toMonthKey(input?: string | Date): Date {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid month');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function monthsUntilYearEnd(start: Date): Date[] {
  const startMonth = start.getUTCMonth();
  const year = start.getUTCFullYear();
  const months: Date[] = [];
  for (let m = startMonth; m <= 11; m++) {
    months.push(new Date(Date.UTC(year, m, 1, 0, 0, 0, 0)));
  }
  return months;
}

@Injectable()
export class SalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async setForYearRemainder(
    userId: string,
    monthStr: string | undefined,
    amount: number,
  ) {
    const start = toMonthKey(monthStr);
    const months = monthsUntilYearEnd(start);
    const ops = months.map((month) =>
      this.prisma.salaryMonth.upsert({
        where: { salary_user_month: { userId, month } },
        update: { amount },
        create: { userId, month, amount },
      }),
    );
    const rows = await this.prisma.$transaction(ops);
    return { affectedMonths: rows.length };
  }

  async getForMonth(userId: string, monthStr?: string) {
    const key = toMonthKey(monthStr ?? new Date().toISOString());
    return this.prisma.salaryMonth.findUnique({
      where: { salary_user_month: { userId, month: key } },
    });
  }
}
