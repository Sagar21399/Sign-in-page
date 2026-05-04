import { Mail, Lock, User as UserIcon, Check, Loader2 } from "lucide-react";
import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(1, "Required").max(60),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  useEffect(() => {
    if (!authLoading && session) navigate(from, { replace: true });
  }, [authLoading, session, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Account created!", { description: "Check your inbox to confirm your email." });
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const message =
          (result.error as { message?: string })?.message ?? "Google sign-in failed. Please try again.";
        toast.error("Google sign-in failed", { description: message });
        setGoogleLoading(false);
        return;
      }
      // result.redirected === true → browser is navigating to Google; keep spinner on
      if (!result.redirected) {
        // Already authenticated via returned tokens
        setGoogleLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast.error("Google sign-in failed", { description: message });
      setGoogleLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset email sent");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">
      <div className="bg-orb w-[500px] h-[500px] -top-32 -left-32" style={{ background: "hsl(280 70% 50%)" }} />
      <div className="bg-orb w-[400px] h-[400px] top-1/3 -right-24" style={{ background: "hsl(340 80% 55%)" }} />
      <div className="bg-orb w-[450px] h-[450px] -bottom-32 left-1/4" style={{ background: "hsl(220 70% 55%)" }} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 glass-card w-full max-w-sm rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500"
      >
        <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-1">
          <UserIcon className="w-10 h-10 text-foreground/70" strokeWidth={1.5} />
        </div>

        <h1 className="text-lg font-semibold tracking-wide">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>

        {mode === "signup" && (
          <div className="w-full flex items-center gap-3 pb-1">
            <UserIcon className="w-5 h-5 text-foreground/80 shrink-0" />
            <input
              type="text"
              required
              maxLength={60}
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="glass-input w-full py-2 text-sm"
              aria-label="Display name"
            />
          </div>
        )}

        <div className="w-full flex items-center gap-3 pb-1">
          <Mail className="w-5 h-5 text-foreground/80 shrink-0" />
          <input
            type="email"
            required
            maxLength={255}
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full py-2 text-sm"
            aria-label="Email"
            autoComplete="email"
          />
        </div>

        <div className="w-full flex items-center gap-3 pb-1">
          <Lock className="w-5 h-5 text-foreground/80 shrink-0" />
          <input
            type="password"
            required
            minLength={6}
            maxLength={100}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full py-2 text-sm"
            aria-label="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        {mode === "signin" && (
          <div className="w-full flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded-sm border border-foreground/60 flex items-center justify-center transition-colors ${
                  remember ? "bg-foreground/90" : "bg-transparent"
                }`}
              >
                {remember && <Check className="w-3 h-3 text-background" strokeWidth={3} />}
              </span>
              <span className="text-foreground/90">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgot}
              className="italic text-foreground/80 hover:text-foreground transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="gradient-button w-full rounded-full py-3 text-sm font-semibold tracking-[0.2em] text-primary-foreground mt-1 disabled:opacity-60"
        >
          {loading ? "PLEASE WAIT…" : mode === "signin" ? "LOGIN" : "SIGN UP"}
        </button>

        <div className="w-full flex items-center gap-3 text-xs text-foreground/60">
          <div className="flex-1 h-px bg-foreground/20" />
          OR
          <div className="flex-1 h-px bg-foreground/20" />
        </div>

        <p className="text-xs text-foreground/70">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-foreground font-medium hover:underline"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </form>
    </main>
  );
};

export default Auth;
