import { MONTHS } from '../constants/date';

export const buildIncomeData = (salary: number, bonus = 100) => {
  const rows = [];
  const startMonth = new Date().getMonth();
  const baseYear = new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const monthIndex = (startMonth + i) % 12;
    const yearOffset = Math.floor((startMonth + i) / 12);
    const monthName = MONTHS[monthIndex]?.short ?? '';

    rows.push({
      name: `${monthName} ${baseYear + yearOffset}`,
      Revenue: salary,
      Bonus: bonus,
    });
  }

  return rows;
};
