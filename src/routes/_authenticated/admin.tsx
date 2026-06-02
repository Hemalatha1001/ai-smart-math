import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Shield, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type Profile = {
  id: string;
  display_name: string | null;
  total_points: number;
  created_at: string;
};
type HistoryRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  detail: string | null;
  created_at: string;
};
type QuizRow = {
  id: string;
  user_id: string;
  topic: string;
  difficulty: string;
  score: number;
  total: number;
  best_streak: number;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Calcverse" }] }),
});

function AdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [p, h, q] = await Promise.all([
        supabase.from("profiles").select("*").order("total_points", { ascending: false }),
        supabase.from("history").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("quiz_scores").select("*").order("created_at", { ascending: false }).limit(500),
      ]);
      if (p.error) toast.error(p.error.message);
      else setProfiles(p.data as Profile[]);
      if (h.data) setHistory(h.data as HistoryRow[]);
      if (q.data) setQuizzes(q.data as QuizRow[]);
    })();
  }, [isAdmin]);

  if (isAdmin === null) return <div className="py-12 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin)
    return (
      <Card className="max-w-md mx-auto p-8 text-center">
        <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h1 className="text-lg font-semibold mb-1">Admins only</h1>
        <p className="text-sm text-muted-foreground">You don't have access to this page.</p>
      </Card>
    );

  const userHistory = selected ? history.filter((h) => h.user_id === selected) : [];
  const userQuizzes = selected ? quizzes.filter((q) => q.user_id === selected) : [];
  const selectedProfile = profiles.find((p) => p.id === selected);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground">All users and their activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Users</div>
          <div className="text-2xl font-bold">{profiles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">History entries</div>
          <div className="text-2xl font-bold">{history.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Quiz attempts</div>
          <div className="text-2xl font-bold">{quizzes.length}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Users</h2>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`w-full text-left p-3 rounded-lg hover:bg-muted transition ${
                  selected === p.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.display_name || "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-sm font-mono">{p.total_points} pts</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">
            {selectedProfile ? `${selectedProfile.display_name || "User"}'s activity` : "Select a user"}
          </h2>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Pick a user on the left to see their history and quizzes.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Quiz attempts ({userQuizzes.length})
                </div>
                {userQuizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No quizzes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userQuizzes.map((q) => (
                      <div key={q.id} className="text-sm border rounded p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{q.topic}</span>
                          <span className="font-mono">{q.score}/{q.total}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {q.difficulty} · streak {q.best_streak} · {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  History ({userHistory.length})
                </div>
                {userHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userHistory.map((h) => (
                      <div key={h.id} className="text-sm border rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider rounded-full bg-primary/10 text-primary px-2 py-0.5">
                            {h.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="font-medium truncate">{h.title}</div>
                        {h.detail && (
                          <div className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">{h.detail}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
