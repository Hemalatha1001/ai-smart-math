import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { evaluate, factorial } from "mathjs";

export function ScientificCalc() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("0");
  const [radians, setRadians] = useState(true);

  const calc = () => {
    try {
      let e = expr
        .replace(/π/g, "pi")
        .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
        .replace(/(\d+)!/g, (_, n) => String(factorial(Number(n))));
      if (!radians) {
        e = e.replace(/\b(sin|cos|tan)\(([^)]+)\)/g, "$1(($2) * pi / 180)");
      }
      const v = evaluate(e);
      setResult(String(+Number(v).toFixed(10)));
    } catch {
      setResult("Error");
    }
  };

  const ins = (s: string) => setExpr((e) => e + s);

  const sci = ["sin(", "cos(", "tan(", "log(", "ln(", "sqrt(", "^", "(", ")", "π", "e", "!"];

  return (
    <Card className="p-6 space-y-4">
      <Input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="e.g. sin(pi/2) + log(100)"
        className="h-14 text-lg font-mono"
      />
      <div className="flex items-center justify-between">
        <div className="text-3xl font-display font-bold">{result}</div>
        <div className="flex items-center gap-2">
          <Label htmlFor="rad" className="text-xs text-muted-foreground">DEG</Label>
          <Switch id="rad" checked={radians} onCheckedChange={setRadians} />
          <Label htmlFor="rad" className="text-xs text-muted-foreground">RAD</Label>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {sci.map((s) => (
          <Button key={s} variant="outline" onClick={() => ins(s)} className="font-mono">{s}</Button>
        ))}
        {["7","8","9","/","C","⌫"].map((s) => (
          <Button key={s} variant={s === "C" || s === "⌫" ? "secondary" : "ghost"}
            onClick={() => s === "C" ? (setExpr(""), setResult("0")) : s === "⌫" ? setExpr((e) => e.slice(0,-1)) : ins(s)}>
            {s}
          </Button>
        ))}
        {["4","5","6","*"].map((s) => <Button key={s} variant="ghost" onClick={() => ins(s)}>{s}</Button>)}
        <Button variant="ghost" className="col-span-2" onClick={() => ins(" ")}>space</Button>
        {["1","2","3","-"].map((s) => <Button key={s} variant="ghost" onClick={() => ins(s)}>{s}</Button>)}
        <Button className="gradient-primary text-primary-foreground row-span-2 col-span-2" onClick={calc}>=</Button>
        {["0",".","+"].map((s) => <Button key={s} variant="ghost" onClick={() => ins(s)}>{s}</Button>)}
      </div>
    </Card>
  );
}
