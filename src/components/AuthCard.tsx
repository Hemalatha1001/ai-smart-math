import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot" | "otp";

export function AuthCard({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<Mode>("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "otp") {
        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${window.location.origin}/` },
          });
          if (error) throw error;
          setOtpSent(true);
          toast.success("OTP sent. Check your email for the 6-digit code.");
        } else {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: otpCode,
            type: "email",
          });
          if (error) throw error;
          onSuccess ? onSuccess() : window.location.replace("/");
        }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (data.session) {
          onSuccess ? onSuccess() : window.location.replace("/");
        } else {
          toast.success("Welcome! Please check your email to confirm.");
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess ? onSuccess() : window.location.replace("/");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your inbox.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error(res.error.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 space-y-6 mx-auto">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold">
          {mode === "signin" && "Welcome back"}
          {mode === "signup" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
          {mode === "otp" && (otpSent ? "Enter your code" : "Sign in with email OTP")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "forgot" && "Enter your email and we'll send a reset link."}
          {mode === "otp" && (otpSent ? `We sent a 6-digit code to ${email}.` : "We'll email you a one-time code — no password needed.")}
          {(mode === "signin" || mode === "signup") && "Sign in to unlock all calculators, history & leaderboard."}
        </p>
      </div>

      {(mode === "signin" || mode === "signup" || mode === "otp") && !otpSent && (
        <>
          <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-2">or with email</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        )}
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode !== "forgot" && (
          <Input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        )}
        <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground">
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Send reset link"}
        </Button>
      </form>

      {mode === "signin" && (
        <div className="flex items-center justify-between text-sm">
          <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            Forgot password?
          </button>
          <button onClick={() => setMode("signup")} className="text-primary underline-offset-4 hover:underline">
            Create account
          </button>
        </div>
      )}
      {mode === "signup" && (
        <div className="text-center text-sm">
          Already have one?{" "}
          <button onClick={() => setMode("signin")} className="text-primary underline-offset-4 hover:underline">
            Sign in
          </button>
        </div>
      )}
      {mode === "forgot" && (
        <div className="text-center text-sm">
          <button onClick={() => setMode("signin")} className="text-primary underline-offset-4 hover:underline">
            ← Back to sign in
          </button>
        </div>
      )}
    </Card>
  );
}
