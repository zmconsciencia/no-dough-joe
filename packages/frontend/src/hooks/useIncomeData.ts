import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { salaryService } from '../services/api/salary.service';
import { bonusService } from '../services/api/bonus.service';
import { mealTicketService } from '../services/api/mealticket.service';
import { MONTHS } from '../constants/date';
import { on, EVENTS } from '../utils/events';

export type IncomeRow = { name: string; Salary: number; Bonus: number; MealTicket: number };

function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}
function monthKey(d: Date) {
  return format(d, 'yyyy-MM-01');
}
function monthLabel(d: Date) {
  const m = d.getUTCMonth();
  const y = d.getUTCFullYear();
  const mon = MONTHS[m]?.short ?? '';
  return `${mon} ${y}`;
}

export function useIncomeData() {
  const [data, setData] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const start = new Date();
    const months = Array.from({ length: 12 }, (_, i) => addMonths(start, i));

    const salaries = await Promise.all(
      months.map(async (d) => {
        const s = await salaryService.getCurrentSalary(monthKey(d)).catch(() => null);
        return { k: monthKey(d), v: s?.amount ?? 0 };
      }),
    );
    const salaryMap = new Map(salaries.map((x) => [x.k, x.v]));

    const [bonusSummary, ticketSummary] = await Promise.all([
      bonusService.getBonusSummary(monthKey(start), 12).catch(() => []),
      mealTicketService.getTopUpSummary(monthKey(start), 12).catch(() => []),
    ]);
    const bonusMap = new Map(bonusSummary.map((b) => [b.month, b.total]));
    const ticketMap = new Map(ticketSummary.map((b) => [b.month, b.total]));

    const rows: IncomeRow[] = months.map((d) => {
      const kIso = new Date(monthKey(d)).toISOString();
      return {
        name: monthLabel(d),
        Salary: salaryMap.get(monthKey(d)) ?? 0,
        Bonus: bonusMap.get(kIso) ?? 0,
        MealTicket: ticketMap.get(kIso) ?? 0,
      };
    });

    setData(rows);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const off1 = on(EVENTS.BONUS_CHANGED, () => fetchData());
    const off2 = on(EVENTS.MEALTICKET_CHANGED, () => fetchData());
    const off3 = on(EVENTS.SALARY_CHANGED, () => fetchData());
    return () => {
      off1();
      off2();
      off3();
    };
  }, []);

  return { data, loading, refetch: fetchData };
}
