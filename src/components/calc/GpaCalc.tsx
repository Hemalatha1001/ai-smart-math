import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const GRADES: Record<string, number> = { "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, D: 1.0, F: 0 };

type Row = { id: number; name: string; credits: number; grade: string };

export function GpaCalc() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: "Math", credits: 3, grade: "A" },
    { id: 2, name: "Physics", credits: 4, grade: "B+" },
    { id: 3, name: "English", credits: 2, grade: "A-" },
  ]);

  const gpa = useMemo(() => {
    const tc = rows.reduce((s, r) => s + r.credits, 0);
    const tp = rows.reduce((s, r) => s + r.credits * (GRADES[r.grade] ?? 0), 0);
    return tc === 0 ? 0 : tp / tc;
  }, [rows]);

  const status = gpa >= 3.7 ? "Excellent 🌟" : gpa >= 3.0 ? "Good 👏" : gpa >= 2.0 ? "Satisfactory" : "Needs improvement";

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-center">
            <Input value={r.name} onChange={(e) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} placeholder="Course" />
            <Input type="number" value={r.credits} onChange={(e) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, credits: +e.target.value } : x))} placeholder="Credits" />
            <Select value={r.grade} onValueChange={(v) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, grade: v } : x))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(GRADES).map((g) => <SelectItem key={g} value={g}>{g} ({GRADES[g]})</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { id: Date.now(), name: "", credits: 3, grade: "A" }])}>
          <Plus className="h-4 w-4 mr-1" /> Add course
        </Button>
      </div>

      <div className="rounded-2xl gradient-primary text-primary-foreground p-6 shadow-elegant text-center">
        <div className="text-xs uppercase tracking-widest opacity-80">Cumulative GPA</div>
        <div className="text-6xl font-display font-bold mt-1">{gpa.toFixed(2)}</div>
        <div className="mt-1 text-sm opacity-90">{status} · out of 4.00</div>
      </div>
    </Card>
  );
}
