import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { evaluate, parse, simplify, derivative } from "mathjs";

type Step = { label: string; value: string };

export function AiSolverCalc() {
  const [input, setInput] = useState("2*x^2 + 3*x - 5");
  const [xVal, setXVal] = useState("2");
  const [result, setResult] = useState<{ steps: Step[]; answer: string; insight: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const examples = ["sin(pi/4) + cos(pi/4)", "2*x^2 + 3*x - 5", "log(1000)", "sqrt(144) + 5!"];

  const solve = () => {
    setErr(null);
    try {
      const node = parse(input);
      const steps: Step[] = [{ label: "Original expression", value: node.toString() }];

      const simplified = simplify(node);
      if (simplified.toString() !== node.toString()) {
        steps.push({ label: "Simplified", value: simplified.toString() });
      }

      let answer = "";
      let insight = "";
      const hasX = /\bx\b/.test(input);

      if (hasX) {
        const x = Number(xVal);
        const v = evaluate(input, { x });
        steps.push({ label: `Substitute x = ${x}`, value: simplified.toString().replace(/x/g, `(${x})`) });
        steps.push({ label: "Evaluate", value: String(v) });
        try {
          const d = derivative(node, "x");
          steps.push({ label: "Derivative dy/dx", value: d.toString() });
          insight = `This is a function of x. At x=${x} it equals ${v}. Its slope is ${d.toString()}.`;
        } catch { /* noop */ }
        answer = String(v);
      } else {
        const v = evaluate(input);
        steps.push({ label: "Evaluate", value: String(v) });
        answer = String(v);
        insight = "Pure numeric expression — evaluated directly using order of operations.";
      }

      setResult({ steps, answer, insight });
    } catch (e) {
      setErr((e as Error).message);
      setResult(null);
    }
  };

  const hasX = useMemo(() => /\bx\b/.test(input), [input]);

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Expression or equation</label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 font-mono text-base h-12" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button key={ex} onClick={() => setInput(ex)} className="text-xs rounded-full bg-muted px-3 py-1 hover:bg-accent transition">
                {ex}
              </button>
            ))}
          </div>
        </div>

        {hasX && (
          <div className="max-w-xs">
            <label className="text-sm font-medium">Value of x</label>
            <Input value={xVal} onChange={(e) => setXVal(e.target.value)} className="mt-1" />
          </div>
        )}

        <Button onClick={solve} className="gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4 mr-2" /> Solve step by step
        </Button>

        {err && <div className="text-sm text-destructive">⚠ {err}</div>}
      </Card>

      {result && (
        <Card className="p-6 space-y-4 animate-fade-in">
          <div className="rounded-2xl gradient-primary text-primary-foreground p-6 shadow-elegant">
            <div className="text-xs uppercase tracking-widest opacity-80">Answer</div>
            <div className="text-5xl font-display font-bold mt-1 break-all">{result.answer}</div>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-2">Steps</h3>
            <ol className="space-y-2">
              {result.steps.map((s, i) => (
                <li key={i} className="rounded-lg bg-muted/40 p-3 flex gap-3">
                  <div className="h-6 w-6 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-mono text-sm break-all">{s.value}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">{result.insight}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
