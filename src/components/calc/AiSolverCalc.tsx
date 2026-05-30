import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, MicOff, Download, LineChart as LineChartIcon } from "lucide-react";
import { evaluate, parse, simplify, derivative } from "mathjs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import jsPDF from "jspdf";
import { toast } from "sonner";

type Step = { label: string; value: string };
type Result = { steps: Step[]; answer: string; insight: string; expression: string; xUsed?: number };

// Convert spoken math phrases to math expression
function speechToMath(s: string): string {
  let t = " " + s.toLowerCase() + " ";
  const map: [RegExp, string][] = [
    [/\bplus\b/g, "+"], [/\bminus\b/g, "-"],
    [/\btimes\b|\bmultiplied by\b|\binto\b/g, "*"],
    [/\bdivided by\b|\bover\b/g, "/"],
    [/\bequals?\b|\bis\b/g, "="],
    [/\bsquared\b/g, "^2"], [/\bcubed\b/g, "^3"],
    [/\bto the power of\b|\bpower\b|\braised to\b/g, "^"],
    [/\bsquare root of\b|\broot of\b/g, "sqrt"],
    [/\bopen (bracket|paren|parenthesis)\b/g, "("],
    [/\bclose (bracket|paren|parenthesis)\b/g, ")"],
    [/\bpi\b/g, "pi"],
    [/\bzero\b/g, "0"], [/\bone\b/g, "1"], [/\btwo\b/g, "2"], [/\bthree\b/g, "3"],
    [/\bfour\b/g, "4"], [/\bfive\b/g, "5"], [/\bsix\b/g, "6"], [/\bseven\b/g, "7"],
    [/\beight\b/g, "8"], [/\bnine\b/g, "9"], [/\bten\b/g, "10"],
  ];
  for (const [re, rep] of map) t = t.replace(re, rep);
  return t.replace(/\s+/g, " ").trim();
}

export function AiSolverCalc() {
  const [input, setInput] = useState("2*x^2 + 3*x - 5");
  const [xVal, setXVal] = useState("2");
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);

  const examples = ["sin(pi/4) + cos(pi/4)", "2*x^2 + 3*x - 5", "log(1000)", "sqrt(144) + 5!"];
  const hasX = useMemo(() => /\bx\b/.test(input), [input]);

  // Voice input setup
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      const mathified = speechToMath(transcript);
      setInput(mathified);
      toast.success(`Heard: "${transcript}"`);
    };
    r.onerror = (e: any) => { toast.error(`Mic error: ${e.error}`); setListening(false); };
    r.onend = () => setListening(false);
    recogRef.current = r;
  }, []);

  const toggleMic = () => {
    if (!recogRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      recogRef.current.stop();
      setListening(false);
    } else {
      try {
        recogRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

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
      const hasXLocal = /\bx\b/.test(input);
      let xUsed: number | undefined;

      if (hasXLocal) {
        const x = Number(xVal);
        xUsed = x;
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

      setResult({ steps, answer, insight, expression: input, xUsed });
    } catch (e) {
      setErr((e as Error).message);
      setResult(null);
    }
  };

  // Generate plot data for functions of x
  const plotData = useMemo(() => {
    if (!result || !hasX) return null;
    const xCenter = result.xUsed ?? 0;
    const range = 10;
    const points: { x: number; y: number }[] = [];
    try {
      for (let i = 0; i <= 80; i++) {
        const x = xCenter - range + (i * (2 * range)) / 80;
        const y = evaluate(result.expression, { x });
        if (typeof y === "number" && isFinite(y)) {
          points.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(4)) });
        }
      }
      return points;
    } catch {
      return null;
    }
  }, [result, hasX]);

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 16;
    let y = 20;

    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text("Calcverse — AI Math Solution", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleString(), margin, y);
    y += 12;

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("Expression:", margin, y); y += 6;
    doc.setFont("courier", "normal");
    doc.text(doc.splitTextToSize(result.expression, 175), margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");

    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text("Answer:", margin, y); y += 7;
    doc.setFontSize(18);
    doc.setTextColor(20);
    doc.text(doc.splitTextToSize(result.answer, 175), margin, y);
    y += 12;

    doc.setFontSize(13);
    doc.setTextColor(99, 102, 241);
    doc.text("Step-by-step:", margin, y); y += 7;
    doc.setFontSize(11);
    doc.setTextColor(40);
    result.steps.forEach((s, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${s.label}`, margin, y); y += 5;
      doc.setFont("courier", "normal");
      const lines = doc.splitTextToSize(s.value, 175);
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 3;
      doc.setFont("helvetica", "normal");
    });

    if (y > 250) { doc.addPage(); y = 20; }
    y += 4;
    doc.setFontSize(12);
    doc.setTextColor(99, 102, 241);
    doc.text("Insight:", margin, y); y += 6;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(doc.splitTextToSize(result.insight, 175), margin, y);

    doc.save(`calcverse-solution-${Date.now()}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Expression or equation</label>
          <div className="mt-1 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-base h-12 flex-1" />
            <Button
              type="button"
              variant={listening ? "destructive" : "outline"}
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={toggleMic}
              title="Voice input"
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button key={ex} onClick={() => setInput(ex)} className="text-xs rounded-full bg-muted px-3 py-1 hover:bg-accent transition">
                {ex}
              </button>
            ))}
          </div>
          {listening && (
            <div className="mt-2 text-xs text-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Listening… try "two x squared plus three x minus five"
            </div>
          )}
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
          <div className="rounded-2xl gradient-primary text-primary-foreground p-6 shadow-elegant flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest opacity-80">Answer</div>
              <div className="text-5xl font-display font-bold mt-1 break-all">{result.answer}</div>
            </div>
            <Button onClick={exportPDF} variant="secondary" size="sm" className="shrink-0">
              <Download className="h-4 w-4 mr-1.5" /> PDF
            </Button>
          </div>

          {plotData && plotData.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-primary" /> Graph of f(x)
              </h3>
              <div className="h-64 w-full rounded-lg border bg-card p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plotData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <ReferenceLine x={result.xUsed} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" opacity={0.4} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
