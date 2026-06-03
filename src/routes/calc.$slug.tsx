import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCalculator } from "@/lib/calculators";
import { CalcShell } from "@/components/CalcShell";
import { BasicCalc } from "@/components/calc/BasicCalc";
import { ScientificCalc } from "@/components/calc/ScientificCalc";
import { BmiCalc } from "@/components/calc/BmiCalc";
import { AgeCalc } from "@/components/calc/AgeCalc";
import { EmiCalc } from "@/components/calc/EmiCalc";
import { CurrencyCalc } from "@/components/calc/CurrencyCalc";
import { UnitCalc } from "@/components/calc/UnitCalc";
import { GpaCalc } from "@/components/calc/GpaCalc";
import { PercentageCalc } from "@/components/calc/PercentageCalc";
import { AiSolverCalc } from "@/components/calc/AiSolverCalc";
import { AiTutorCalc } from "@/components/calc/AiTutorCalc";
import { QuizCalc } from "@/components/calc/QuizCalc";
import { useAuth } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";

const MAP: Record<string, () => React.ReactElement> = {
  basic: BasicCalc,
  scientific: ScientificCalc,
  bmi: BmiCalc,
  age: AgeCalc,
  emi: EmiCalc,
  currency: CurrencyCalc,
  unit: UnitCalc,
  gpa: GpaCalc,
  percentage: PercentageCalc,
  "ai-solver": AiSolverCalc,
  "ai-tutor": AiTutorCalc,
  quiz: QuizCalc,
};

export const Route = createFileRoute("/calc/$slug")({
  loader: ({ params }) => {
    const meta = getCalculator(params.slug);
    if (!meta) throw notFound();
    // Return only serializable data — icon is a React component, look it up on the client
    return { name: meta.name, description: meta.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Calcverse` },
          { name: "description", content: loaderData.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="text-2xl font-display font-bold">Calculator not found</h1>
      <p className="text-muted-foreground mt-2">Pick one from the sidebar.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="text-center py-20">
      <h1 className="text-2xl font-display font-bold">Something broke</h1>
      <p className="text-muted-foreground mt-2">{error.message}</p>
    </div>
  ),
  component: CalcPage,
});

function CalcPage() {
  const { slug } = Route.useParams();
  const meta = getCalculator(slug);
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold">Sign in to use this calculator</h1>
          <p className="text-sm text-muted-foreground">Calcverse features are unlocked for signed-in users.</p>
        </div>
        <AuthCard />
      </div>
    );
  }
  if (!meta) return null;
  const Component = MAP[meta.slug];
  return (
    <CalcShell title={meta.name} description={meta.description} icon={meta.icon} accent={meta.accent}>
      <Component />
    </CalcShell>
  );
}
