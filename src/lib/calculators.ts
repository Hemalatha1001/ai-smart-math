import {
  Calculator, FlaskConical, HeartPulse, Cake, Landmark,
  Coins, Ruler, GraduationCap, Percent, Sparkles,
  type LucideIcon,
} from "lucide-react";

export type CalculatorMeta = {
  slug: string;
  name: string;
  description: string;
  category: "Basic" | "Scientific" | "Health" | "Financial" | "Academic" | "Utility" | "AI";
  icon: LucideIcon;
  accent: string;
};

export const CALCULATORS: CalculatorMeta[] = [
  { slug: "basic", name: "Basic Calculator", description: "Add, subtract, multiply, divide with memory", category: "Basic", icon: Calculator, accent: "from-blue-500 to-indigo-500" },
  { slug: "scientific", name: "Scientific", description: "Trig, log, exp, factorials, radians", category: "Scientific", icon: FlaskConical, accent: "from-violet-500 to-fuchsia-500" },
  { slug: "bmi", name: "BMI Calculator", description: "Body mass index with health insights", category: "Health", icon: HeartPulse, accent: "from-emerald-500 to-teal-500" },
  { slug: "age", name: "Age Calculator", description: "Exact age in years, months, days", category: "Utility", icon: Cake, accent: "from-pink-500 to-rose-500" },
  { slug: "emi", name: "EMI / Loan", description: "Loan EMI with amortization chart", category: "Financial", icon: Landmark, accent: "from-amber-500 to-orange-500" },
  { slug: "currency", name: "Currency Converter", description: "Live FX rates across 30+ currencies", category: "Financial", icon: Coins, accent: "from-yellow-500 to-amber-500" },
  { slug: "unit", name: "Unit Converter", description: "Length, weight, temperature, volume…", category: "Utility", icon: Ruler, accent: "from-cyan-500 to-sky-500" },
  { slug: "gpa", name: "GPA / CGPA", description: "Track grades and semester averages", category: "Academic", icon: GraduationCap, accent: "from-purple-500 to-indigo-500" },
  { slug: "percentage", name: "Percentage", description: "Discount, change, profit & loss", category: "Basic", icon: Percent, accent: "from-lime-500 to-green-500" },
  { slug: "ai-solver", name: "AI Math Solver", description: "Expression solver with step-by-step", category: "AI", icon: Sparkles, accent: "from-indigo-500 via-purple-500 to-pink-500" },
];

export const getCalculator = (slug: string) =>
  CALCULATORS.find((c) => c.slug === slug);
