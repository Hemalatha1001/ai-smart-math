import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  children: ReactNode;
}

export function CalcShell({ title, description, icon: Icon, accent, children }: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start gap-4 animate-fade-in">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-elegant`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
