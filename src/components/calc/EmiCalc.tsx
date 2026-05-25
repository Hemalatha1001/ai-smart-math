import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function EmiCalc() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(10);

  const { emi, total, interest, chart } = useMemo(() => {
    const n = years * 12;
    const r = rate / 12 / 100;
    const emi = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - amount;
    let bal = amount;
    const chart = [];
    for (let m = 1; m <= n; m++) {
      const intP = bal * r;
      const prinP = emi - intP;
      bal -= prinP;
      if (m % 12 === 0 || m === n) chart.push({ year: Math.ceil(m / 12), balance: Math.max(0, Math.round(bal)) });
    }
    return { emi, total, interest, chart };
  }, [amount, rate, years]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <Card className="p-6 space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div><Label>Loan amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1" /></div>
        <div><Label>Interest rate (%)</Label><Input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (years)</Label><Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Monthly EMI" value={fmt(emi)} highlight />
        <Stat label="Total interest" value={fmt(interest)} />
        <Stat label="Total payment" value={fmt(total)} />
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} />
            <YAxis />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "gradient-primary text-primary-foreground shadow-elegant" : "bg-muted/40"}`}>
      <div className={`text-xs ${highlight ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-2xl font-display font-bold mt-1">{value}</div>
    </div>
  );
}
