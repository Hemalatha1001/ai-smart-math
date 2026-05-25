import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function PercentageCalc() {
  return (
    <Tabs defaultValue="basic">
      <TabsList>
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="change">% Change</TabsTrigger>
        <TabsTrigger value="discount">Discount</TabsTrigger>
        <TabsTrigger value="pl">Profit / Loss</TabsTrigger>
      </TabsList>

      <TabsContent value="basic"><Basic /></TabsContent>
      <TabsContent value="change"><Change /></TabsContent>
      <TabsContent value="discount"><Discount /></TabsContent>
      <TabsContent value="pl"><PL /></TabsContent>
    </Tabs>
  );
}

function Result({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl gradient-primary text-primary-foreground p-5 shadow-elegant">
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-3xl font-display font-bold mt-1">{value}</div>
    </div>
  );
}

function Basic() {
  const [p, setP] = useState(20); const [n, setN] = useState(150);
  return (
    <Card className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Percent</Label><Input type="number" value={p} onChange={(e) => setP(+e.target.value)} /></div>
        <div><Label>Of number</Label><Input type="number" value={n} onChange={(e) => setN(+e.target.value)} /></div>
      </div>
      <Result label={`${p}% of ${n}`} value={((p * n) / 100).toFixed(2)} />
    </Card>
  );
}

function Change() {
  const [a, setA] = useState(80); const [b, setB] = useState(120);
  const ch = a === 0 ? 0 : ((b - a) / a) * 100;
  return (
    <Card className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>From</Label><Input type="number" value={a} onChange={(e) => setA(+e.target.value)} /></div>
        <div><Label>To</Label><Input type="number" value={b} onChange={(e) => setB(+e.target.value)} /></div>
      </div>
      <Result label={ch >= 0 ? "Increase" : "Decrease"} value={`${ch.toFixed(2)}%`} />
    </Card>
  );
}

function Discount() {
  const [price, setPrice] = useState(2000); const [pct, setPct] = useState(25);
  const saved = (price * pct) / 100;
  return (
    <Card className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Original price</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
        <div><Label>Discount %</Label><Input type="number" value={pct} onChange={(e) => setPct(+e.target.value)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Result label="You save" value={saved.toFixed(2)} />
        <Result label="Final price" value={(price - saved).toFixed(2)} />
      </div>
    </Card>
  );
}

function PL() {
  const [cost, setCost] = useState(1000); const [sell, setSell] = useState(1250);
  const diff = sell - cost;
  const pct = cost === 0 ? 0 : (diff / cost) * 100;
  return (
    <Card className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Cost price</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} /></div>
        <div><Label>Selling price</Label><Input type="number" value={sell} onChange={(e) => setSell(+e.target.value)} /></div>
      </div>
      <Result label={diff >= 0 ? "Profit" : "Loss"} value={`${Math.abs(diff).toFixed(2)} (${pct.toFixed(2)}%)`} />
    </Card>
  );
}
