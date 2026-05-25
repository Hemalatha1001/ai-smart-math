import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { evaluate } from "mathjs";

const keys = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "√", "="],
];

export function BasicCalc() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("0");
  const [memory, setMemory] = useState(0);

  const compute = useCallback((toEval: string) => {
    try {
      const normalized = toEval
        .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
        .replace(/√\(?([0-9.]+)\)?/g, "sqrt($1)")
        .replace(/%/g, "/100");
      const v = evaluate(normalized);
      return typeof v === "number" ? String(+v.toFixed(10)) : String(v);
    } catch {
      return "Error";
    }
  }, []);

  const press = useCallback((k: string) => {
    if (k === "C") { setExpr(""); setResult("0"); return; }
    if (k === "=") { setResult(compute(expr || "0")); return; }
    if (k === "±") { setExpr((e) => (e.startsWith("-") ? e.slice(1) : "-" + e)); return; }
    if (k === "√") { setExpr((e) => e + "√("); return; }
    setExpr((e) => e + k);
  }, [expr, compute]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { "*": "×", "/": "÷", "-": "−", Enter: "=", Escape: "C", Backspace: "BACK" };
      const k = map[e.key] ?? e.key;
      if (k === "BACK") { setExpr((s) => s.slice(0, -1)); return; }
      if ("0123456789.+%".includes(k) || ["×", "÷", "−", "+", "=", "C"].includes(k)) {
        e.preventDefault();
        press(k);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [press]);

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-6">
      <Card className="p-6">
        <div className="rounded-xl bg-muted/50 p-5 mb-4 text-right">
          <div className="text-sm text-muted-foreground h-5 truncate">{expr || "\u00a0"}</div>
          <div className="text-4xl font-display font-bold tracking-tight mt-1 truncate">{result}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {keys.flat().map((k) => {
            const isOp = ["÷", "×", "−", "+", "="].includes(k);
            const isFn = ["C", "±", "%", "√"].includes(k);
            return (
              <Button
                key={k}
                variant={k === "=" ? "default" : isOp ? "secondary" : isFn ? "outline" : "ghost"}
                className={`h-14 text-lg font-medium ${k === "=" ? "gradient-primary text-primary-foreground" : ""}`}
                onClick={() => press(k)}
              >
                {k}
              </Button>
            );
          })}
        </div>
      </Card>
      <Card className="p-4 space-y-2 h-fit">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Memory</div>
        <div className="text-2xl font-display font-semibold">{memory}</div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => setMemory(0)}>MC</Button>
          <Button size="sm" variant="outline" onClick={() => setMemory(Number(result) || 0)}>MS</Button>
          <Button size="sm" variant="outline" onClick={() => setMemory((m) => m + (Number(result) || 0))}>M+</Button>
          <Button size="sm" variant="outline" onClick={() => setMemory((m) => m - (Number(result) || 0))}>M−</Button>
          <Button size="sm" variant="secondary" className="col-span-2" onClick={() => setExpr((e) => e + memory)}>MR</Button>
        </div>
        <p className="text-xs text-muted-foreground pt-2">Tip: use your keyboard for fast input.</p>
      </Card>
    </div>
  );
}
