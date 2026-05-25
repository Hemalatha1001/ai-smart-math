import { createFileRoute, Link } from "@tanstack/react-router";
import { CALCULATORS } from "@/lib/calculators";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Calcverse — Smart AI Multi Calculator" },
      { name: "description", content: "10 powerful calculators in one beautiful app. Basic, scientific, financial, health, academic, and AI-powered tools." },
    ],
  }),
});

function Index() {
  const popular = ["basic", "scientific", "emi", "bmi", "ai-solver", "unit"];
  const popularCalcs = popular.map((s) => CALCULATORS.find((c) => c.slug === s)!).filter(Boolean);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass shadow-elegant p-8 md:p-12 animate-fade-in">
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-enhanced calculations
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold tracking-tight">
            Every calculator <br /> you'll ever need, <span className="text-gradient">in one place</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            From quick arithmetic to scientific equations, loan amortization, BMI, GPA, and an AI math solver —
            all wrapped in a clean, fast, modern interface.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/calc/$slug" params={{ slug: "basic" }} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elegant hover-scale">
              <Zap className="h-4 w-4" /> Start calculating
            </Link>
            <Link to="/calc/$slug" params={{ slug: "ai-solver" }} className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-5 py-3 text-sm font-medium hover-scale">
              <Sparkles className="h-4 w-4 text-primary" /> Try AI solver
            </Link>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-semibold">Popular calculators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCalcs.map((c) => (
            <CalculatorCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      {/* All categories */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-4">All calculators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CALCULATORS.map((c) => (
            <CalculatorCard key={c.slug} c={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CalculatorCard({ c }: { c: (typeof CALCULATORS)[number] }) {
  const Icon = c.icon;
  return (
    <Link
      to="/calc/$slug"
      params={{ slug: c.slug }}
      className="group relative overflow-hidden rounded-2xl glass shadow-soft hover:shadow-elegant transition-all p-5 hover-scale"
    >
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${c.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
      <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center shadow-soft mb-4`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{c.category}</div>
        <div className="font-display font-semibold text-base">{c.name}</div>
        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
      </div>
    </Link>
  );
}
