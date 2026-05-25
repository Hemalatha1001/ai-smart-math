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
};

export const Route = createFileRoute("/calc/$slug")({
  loader: ({ params }) => {
    const meta = getCalculator(params.slug);
    if (!meta) throw notFound();
    return { meta };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.meta.name} — Calcverse` },
          { name: "description", content: loaderData.meta.description },
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
  const { meta } = Route.useLoaderData();
  const Component = MAP[meta.slug];
  return (
    <CalcShell title={meta.name} description={meta.description} icon={meta.icon} accent={meta.accent}>
      <Component />
    </CalcShell>
  );
}
