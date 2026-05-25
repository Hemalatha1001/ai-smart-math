import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Conv = Record<string, number>;
const UNITS: Record<string, { units: Conv; special?: boolean }> = {
  Length:   { units: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 } },
  Weight:   { units: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, Pound: 0.453592, Ounce: 0.0283495, Tonne: 1000 } },
  Speed:    { units: { "m/s": 1, "km/h": 0.277778, "mph": 0.44704, "knot": 0.514444 } },
  Area:     { units: { "Sq Meter": 1, "Sq Km": 1e6, "Hectare": 10000, "Sq Foot": 0.092903, "Acre": 4046.86 } },
  Volume:   { units: { Liter: 1, Milliliter: 0.001, "Cubic m": 1000, Gallon: 3.78541, Cup: 0.236588 } },
  Temperature: { units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 }, special: true },
};

function convertTemp(v: number, from: string, to: string) {
  const c = from === "Celsius" ? v : from === "Fahrenheit" ? (v - 32) * 5/9 : v - 273.15;
  return to === "Celsius" ? c : to === "Fahrenheit" ? c * 9/5 + 32 : c + 273.15;
}

export function UnitCalc() {
  const cats = Object.keys(UNITS);
  const [cat, setCat] = useState<string>("Length");
  const unitKeys = Object.keys(UNITS[cat].units);
  const [from, setFrom] = useState(unitKeys[0]);
  const [to, setTo] = useState(unitKeys[1]);
  const [val, setVal] = useState(1);

  const result = useMemo(() => {
    if (UNITS[cat].special) return convertTemp(val, from, to);
    const u = UNITS[cat].units;
    return (val * u[from]) / u[to];
  }, [val, from, to, cat]);

  return (
    <Card className="p-6 space-y-6">
      <Tabs value={cat} onValueChange={(v) => { setCat(v); const uk = Object.keys(UNITS[v].units); setFrom(uk[0]); setTo(uk[1]); }}>
        <TabsList className="flex-wrap h-auto">{cats.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList>
      </Tabs>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>From</Label>
          <Input type="number" value={val} onChange={(e) => setVal(+e.target.value)} className="mt-1" />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>{unitKeys.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>To</Label>
          <div className="mt-1 h-10 rounded-md border border-input px-3 flex items-center text-lg font-semibold">
            {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </div>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>{unitKeys.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
