import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AgeCalc() {
  const [dob, setDob] = useState("2000-01-01");
  const today = new Date();

  const data = useMemo(() => {
    const d = new Date(dob);
    if (isNaN(+d)) return null;
    let years = today.getFullYear() - d.getFullYear();
    let months = today.getMonth() - d.getMonth();
    let days = today.getDate() - d.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((+today - +d) / 86400000);
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    const toBirthday = Math.ceil((+next - +today) / 86400000);
    return { years, months, days, totalDays, weeks: Math.floor(totalDays / 7), hours: totalDays * 24, toBirthday };
  }, [dob, today]);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <Label>Your date of birth</Label>
        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 max-w-xs" />
      </div>

      {data && (
        <>
          <div className="rounded-2xl glass p-6 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">You are</div>
            <div className="mt-2 text-5xl font-display font-bold">
              <span className="text-gradient">{data.years}</span> <span className="text-lg text-muted-foreground">years</span>{" "}
              {data.months} <span className="text-lg text-muted-foreground">mo</span>{" "}
              {data.days} <span className="text-lg text-muted-foreground">d</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total days" value={data.totalDays.toLocaleString()} />
            <Stat label="Total weeks" value={data.weeks.toLocaleString()} />
            <Stat label="Total hours" value={data.hours.toLocaleString()} />
            <Stat label="Next birthday in" value={`${data.toBirthday} days 🎂`} />
          </div>
        </>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
