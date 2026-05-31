import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

type Row = { id: string; display_name: string | null; total_points: number };

export const Route = createFileRoute("/_authenticated/leaderboard")({
  component: LeaderboardPage,
  head: () => ({ meta: [{ title: "Leaderboard — Calcverse" }] }),
});

function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, total_points")
        .order("total_points", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Trophy className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top quizzers across Calcverse.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {rows.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">No scores yet — be the first!</div>
          )}
          {rows.map((r, i) => {
            const isMe = r.id === user?.id;
            const medalColor =
              i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-muted-foreground";
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 p-4 ${isMe ? "bg-primary/5" : ""}`}
              >
                <div className="w-8 text-center font-bold tabular-nums">
                  {i < 3 ? <Medal className={`h-5 w-5 mx-auto ${medalColor}`} /> : i + 1}
                </div>
                <div className="flex-1 truncate font-medium">
                  {r.display_name || "Anonymous"} {isMe && <span className="text-xs text-primary">(you)</span>}
                </div>
                <div className="font-mono font-bold text-primary">{r.total_points} pts</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
