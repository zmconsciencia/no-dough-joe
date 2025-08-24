import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { expenseService, CategorySummaryRow } from '../services/api/expense.service';
import { categoryService } from '../services/api/category.service';
import { on, EVENTS } from '../utils/events';
import type { Category } from '../models/category.model';

export interface Row {
  name: string;
  [categoryName: string]: number | string;
}

function monthStartUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}
function monthISO(d: Date) {
  return format(d, 'yyyy-MM-01');
}
function monthLabel(d: Date) {
  return d.toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function useSpendingData() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const end = monthStartUTC(new Date());
    const months = Array.from({ length: 12 }, (_, i) => addMonths(end, -11 + i));

    const [allCats] = await Promise.all([categoryService.listMyCategories()]);
    setCats(allCats);

    const data: Row[] = [];
    for (const d of months) {
      const iso = monthISO(d);
      const summary: CategorySummaryRow[] = await expenseService.getCategorySummary(iso).catch(() => []);
      const row: Row = { name: monthLabel(d) };
      summary.forEach((s) => {
        row[s.name] = s.total;
      });
      data.push(row);
    }

    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const off = [
      on(EVENTS.EXPENSE_CHANGED, () => fetchData()),
      on(EVENTS.RECURRING_CHANGED, () => fetchData()),
      on(EVENTS.CATEGORY_CHANGED, () => fetchData()),
    ];
    return () => off.forEach((x) => x());
  }, []);

  const colorByName = useMemo(() => {
    const m = new Map<string, string>();
    cats.forEach((c) => m.set(c.name, c.color));
    return m;
  }, [cats]);

  const keys = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => k !== 'name' && s.add(k)));
    return Array.from(s).sort();
  }, [rows]);

  return { data: rows, keys, colorByName, loading, refetch: fetchData };
}
