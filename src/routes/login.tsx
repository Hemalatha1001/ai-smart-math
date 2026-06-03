import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Calcverse" }] }),
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 gap-4">
      <AuthCard />
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back to Calcverse
      </Link>
    </div>
  );
}
