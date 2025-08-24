import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CURRENCY_OPTIONS } from '../../constants/currency';
import { useUserStore } from '../../state/user/user.state';
import ChartCard from './ChartCard';
import { useSpendingData } from '../../hooks/useSpendingData';

type Props = { ratio: number };

function TotalTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const items = payload.map((p) => ({
    name: (p?.dataKey as string) ?? '',
    v: Number(p?.value ?? 0),
  }));
  const total = items.reduce((a, b) => a + b.v, 0);
  return (
    <div style={{ background: 'white', border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {items.map((it) => (
        <div key={it.name}>
          {it.name}: {it.v.toFixed(2)}
        </div>
      ))}
      <div style={{ marginTop: 6, fontWeight: 700 }}>Total: {total.toFixed(2)}</div>
    </div>
  );
}

const SpendingChart = ({ ratio }: Props) => {
  const profile = useUserStore((s) => s.user?.profile);
  const symbol = CURRENCY_OPTIONS.find((c) => c.code === profile?.currency)?.symbol ?? '€';
  const { data, keys, colorByName } = useSpendingData();

  return (
    <ChartCard id="spending" title="Spending by Category" ratio={ratio}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: `Spending (${symbol})`, angle: -90, position: 'insideLeft', dy: 70 }} />
          <Tooltip content={<TotalTooltip />} />
          <Legend />
          {keys.map((k) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colorByName.get(k) || '#999999'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SpendingChart;
