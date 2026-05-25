import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CODES = ["USD","EUR","GBP","JPY","INR","CNY","AUD","CAD","CHF","SGD","HKD","NZD","SEK","NOK","KRW","MXN","BRL","ZAR","TRY","AED"];

export function CurrencyCalc() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true); setErr(null);
    fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => { if (!cancel) setRate(d.rates?.[to] ?? null); })
      .catch(() => { if (!cancel) setErr("Couldn't fetch live rates"); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [from, to]);

  const converted = rate ? amount * rate : 0;
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <Card className="p-6 space-y-6">
      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <Label>Amount</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1" />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>{CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={swap} className="mb-1"><ArrowRightLeft className="h-4 w-4" /></Button>
        <div>
          <Label>Converts to</Label>
          <div className="mt-1 h-10 rounded-md border border-input px-3 flex items-center text-lg font-semibold">
            {loading ? "…" : converted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </div>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>{CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {err ? err : rate ? <>1 {from} = <strong className="text-foreground">{rate.toFixed(4)}</strong> {to} · live via Frankfurter</> : "Loading rate…"}
      </div>
    </Card>
  );
}
