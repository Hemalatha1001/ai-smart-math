import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, History as HistoryIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type Row = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Calcverse" }] }),
});

function HistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setRows(data as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("history").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <HistoryIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Your History</h1>
          <p className="text-sm text-muted-foreground">All your saved solutions, chats and quizzes.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nothing here yet — solve a problem or finish a quiz to start your history.
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider rounded-full bg-primary/10 text-primary px-2 py-0.5">
                    {r.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="font-medium truncate">{r.title}</div>
                {r.detail && (
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-1 whitespace-pre-wrap">{r.detail}</div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
