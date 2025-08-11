import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import ChartCard from './ChartCard';
import { useIncomeData } from '../../hooks/useIncomeData';

type Props = { ratio: number };

const fmt = (n: number, symbol: string) => `${symbol} ${n.toFixed(2)}`;

function CustomTooltip({ active, label, payload, symbol }: any) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0);
  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', padding: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, background: p.color }} />
          <span>
            {p.name}: {fmt(Number(p.value || 0), symbol)}
          </span>
        </div>
      ))}
      <hr style={{ margin: '8px 0' }} />
      <div style={{ fontWeight: 600 }}>Total: {fmt(total, symbol)}</div>
    </div>
  );
}

const IncomeChart = ({ ratio }: Props) => {
  const profile = useUserStore((s) => s.user?.profile);
  const symbol = CURRENCY_OPTIONS.find((c) => c.code === profile?.currency)?.symbol ?? '€';
  const { data } = useIncomeData();

  return (
    <ChartCard id="income" title="Income" ratio={ratio}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 5, left: 5 }}>
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
          <Tooltip content={<CustomTooltip symbol={symbol} />} />
          <Legend />
          <Bar dataKey="Salary" stackId="a" fill="#8884d8" />
          <Bar dataKey="Bonus" stackId="a" fill="#82ca9d" />
          <Bar dataKey="MealTicket" stackId="a" fill="#ff5e58ff" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default IncomeChart;
