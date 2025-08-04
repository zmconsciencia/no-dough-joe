import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import ChartCard from './ChartCard';
import { buildIncomeData } from '../../utils/chartData';

type Props = { ratio: number };

const SpendingChart = ({ ratio }: Props) => {
  const profile = useUserStore((s) => s.user?.profile);
  const salary = profile?.monthlyIncome ?? 0;
  const symbol = CURRENCY_OPTIONS.find((c) => c.code === profile?.currency)?.symbol ?? '€';

  return (
    <ChartCard id="spending" title="Spending" ratio={ratio}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buildIncomeData(salary)} margin={{ top: 30, right: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{
              value: `Income (${symbol})`,
              angle: -90,
              position: 'insideLeft',
              dy: 70,
            }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="Revenue" stackId="a" fill="#8884d8" />
          <Bar dataKey="Bonus" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SpendingChart;
