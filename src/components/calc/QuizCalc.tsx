import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Trophy, Flame, RotateCw } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Topic = "arithmetic" | "algebra" | "geometry";
type Difficulty = "easy" | "medium" | "hard";
type Question = { q: string; choices: string[]; answer: number; explain?: string };

const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildQuestion = (topic: Topic, diff: Difficulty): Question => {
  const range = diff === "easy" ? [1, 12] : diff === "medium" ? [5, 50] : [10, 200];
  const [lo, hi] = range;

  if (topic === "arithmetic") {
    const ops = diff === "easy" ? ["+", "-"] : diff === "medium" ? ["+", "-", "×"] : ["+", "-", "×", "÷"];
    const op = ops[rng(0, ops.length - 1)];
    let a = rng(lo, hi);
    let b = rng(lo, hi);
    let ans = 0;
    if (op === "+") ans = a + b;
    if (op === "-") ans = a - b;
    if (op === "×") ans = a * b;
    if (op === "÷") {
      ans = rng(2, 12);
      b = rng(2, 12);
      a = ans * b;
    }
    const distractors = shuffle([ans + rng(1, 5), ans - rng(1, 5), ans + rng(6, 12)]).slice(0, 3);
    const choices = shuffle([ans, ...distractors]).map(String);
    return { q: `${a} ${op} ${b} = ?`, choices, answer: choices.indexOf(String(ans)) };
  }

  if (topic === "algebra") {
    // ax + b = c  → solve for x
    const x = rng(lo, hi);
    const a = diff === "easy" ? 1 : rng(2, 6);
    const b = rng(1, hi);
    const c = a * x + b;
    const choices = shuffle([x, x + 1, x - 1, x + 2]).map(String);
    return { q: `Solve for x:  ${a}x + ${b} = ${c}`, choices, answer: choices.indexOf(String(x)) };
  }

  // geometry
  const kind = rng(0, 2);
  if (kind === 0) {
    const s = rng(lo, hi);
    const ans = s * s;
    const choices = shuffle([ans, 4 * s, ans + s, ans - s]).map(String);
    return { q: `Area of a square with side ${s}?`, choices, answer: choices.indexOf(String(ans)) };
  }
  if (kind === 1) {
    const r = rng(lo, hi);
    const ans = 2 * r;
    const choices = shuffle([ans, r * r, r + 2, ans + r]).map(String);
    return { q: `Diameter of a circle with radius ${r}?`, choices, answer: choices.indexOf(String(ans)) };
  }
  const w = rng(lo, hi);
  const h = rng(lo, hi);
  const ans = 2 * (w + h);
  const choices = shuffle([ans, w * h, ans + 2, ans - 2]).map(String);
  return { q: `Perimeter of a rectangle ${w}×${h}?`, choices, answer: choices.indexOf(String(ans)) };
};

const TOTAL = 10;

export function QuizCalc() {
  const { t } = useT();
  const { user } = useAuth();
  const savedRef = useRef<string | null>(null);
  const [topic, setTopic] = useState<Topic>("arithmetic");
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = useMemo(() => {
    void seed;
    return Array.from({ length: TOTAL }, () => buildQuestion(topic, diff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, topic, diff]);

  const q = questions[index];
  const finished = index >= TOTAL;

  const start = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setStarted(true);
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  };

  const advance = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  // persist when a run finishes
  useEffect(() => {
    if (!finished || !user) return;
    const key = `${seed}-${topic}-${diff}`;
    if (savedRef.current === key) return;
    savedRef.current = key;
    (async () => {
      const { error: e1 } = await supabase.from("quiz_scores").insert({
        user_id: user.id,
        topic,
        difficulty: diff,
        score,
        total: TOTAL,
        best_streak: bestStreak,
      });
      if (e1) toast.error(e1.message);
      await supabase.from("history").insert({
        user_id: user.id,
        type: "quiz",
        title: `Quiz · ${topic} · ${diff}`,
        detail: `Score ${score}/${TOTAL} · best streak ${bestStreak}`,
      });
    })();
  }, [finished, user, seed, topic, diff, score, bestStreak]);

  if (!started) {
    return (
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("topic")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["arithmetic", "algebra", "geometry"] as Topic[]).map((tp) => (
              <Button key={tp} variant={topic === tp ? "default" : "outline"} onClick={() => setTopic(tp)}>
                {t(tp)}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("difficulty")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <Button key={d} variant={diff === d ? "default" : "outline"} onClick={() => setDiff(d)}>
                {t(d)}
              </Button>
            ))}
          </div>
        </div>
        <Button size="lg" className="w-full gradient-primary text-primary-foreground" onClick={start}>
          {t("start")} →
        </Button>
      </Card>
    );
  }

  if (finished) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold">{t("results")}</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="rounded-xl bg-muted p-4">
            <div className="text-xs text-muted-foreground">{t("score")}</div>
            <div className="text-2xl font-bold">{score}/{TOTAL}</div>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <div className="text-xs text-muted-foreground">%</div>
            <div className="text-2xl font-bold">{pct}%</div>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <div className="text-xs text-muted-foreground">{t("streak")}</div>
            <div className="text-2xl font-bold">{bestStreak}</div>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={start} className="gradient-primary text-primary-foreground">
            <RotateCw className="h-4 w-4 mr-2" /> {t("restart")}
          </Button>
          <Button variant="outline" onClick={() => setStarted(false)}>
            {t("topic")} / {t("difficulty")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("question")} {index + 1} {t("of")} {TOTAL}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-primary" /> {score}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" /> {streak}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full gradient-primary transition-all"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / TOTAL) * 100}%` }}
        />
      </div>

      <div className="text-2xl font-display font-semibold py-4 text-center">{q.q}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.choices.map((c, i) => {
          const isCorrect = selected !== null && i === q.answer;
          const isWrong = selected === i && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`rounded-xl border-2 p-4 text-left font-medium transition-all ${
                isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : isWrong
                  ? "border-destructive bg-destructive/10"
                  : selected !== null
                  ? "border-border opacity-50"
                  : "border-border hover:border-primary hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{c}</span>
                {isCorrect && <Check className="h-5 w-5 text-green-500" />}
                {isWrong && <X className="h-5 w-5 text-destructive" />}
              </div>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="space-y-3">
          <div className={`text-sm ${selected === q.answer ? "text-green-600" : "text-destructive"}`}>
            {selected === q.answer ? `✓ ${t("correct")}` : `✗ ${t("wrong")} ${q.choices[q.answer]}`}
          </div>
          <Button onClick={advance} className="w-full gradient-primary text-primary-foreground">
            {index === TOTAL - 1 ? t("finish") : t("next")} →
          </Button>
        </div>
      )}
    </Card>
  );
}
