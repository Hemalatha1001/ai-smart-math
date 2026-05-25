import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function BmiCalc() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [h, setH] = useState(170);
  const [w, setW] = useState(70);

  const bmi = useMemo(() => {
    if (unit === "metric") return w / ((h / 100) ** 2);
    return (w / (h * h)) * 703;
  }, [h, w, unit]);

  const { label, tip, color } =
    bmi < 18.5 ? { label: "Underweight", tip: "Consider a calorie-dense, nutritious diet.", color: "text-sky-500" } :
    bmi < 25 ? { label: "Healthy", tip: "Great range — maintain balanced habits.", color: "text-emerald-500" } :
    bmi < 30 ? { label: "Overweight", tip: "Aim for moderate activity and mindful eating.", color: "text-amber-500" } :
    { label: "Obese", tip: "Consult a clinician for a tailored plan.", color: "text-rose-500" };

  return (
    <Card className="p-6 space-y-6">
      <Tabs value={unit} onValueChange={(v) => setUnit(v as never)}>
        <TabsList>
          <TabsTrigger value="metric">Metric (cm / kg)</TabsTrigger>
          <TabsTrigger value="imperial">Imperial (in / lb)</TabsTrigger>
        </TabsList>
        <TabsContent value={unit} />
      </Tabs>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Height ({unit === "metric" ? "cm" : "in"})</Label>
          <Input type="number" value={h} onChange={(e) => setH(+e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Weight ({unit === "metric" ? "kg" : "lb"})</Label>
          <Input type="number" value={w} onChange={(e) => setW(+e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="rounded-2xl glass p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your BMI</div>
        <div className="text-6xl font-display font-bold mt-2">{bmi.toFixed(1)}</div>
        <div className={`mt-2 font-semibold ${color}`}>{label}</div>
        <div className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">💡 {tip}</div>
      </div>
    </Card>
  );
}
