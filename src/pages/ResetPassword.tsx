import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery token in the URL hash and emits PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate("/", { replace: true });
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">
      <div className="bg-orb w-[500px] h-[500px] -top-32 -left-32" style={{ background: "hsl(280 70% 50%)" }} />
      <div className="bg-orb w-[450px] h-[450px] -bottom-32 right-1/4" style={{ background: "hsl(220 70% 55%)" }} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 glass-card w-full max-w-sm rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-5"
      >
        <h1 className="text-lg font-semibold tracking-wide">Set a new password</h1>
        <div className="w-full flex items-center gap-3 pb-1">
          <Lock className="w-5 h-5 text-foreground/80 shrink-0" />
          <input
            type="password"
            required
            minLength={6}
            maxLength={100}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full py-2 text-sm"
            aria-label="New password"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !ready}
          className="gradient-button w-full rounded-full py-3 text-sm font-semibold tracking-[0.2em] text-primary-foreground disabled:opacity-60"
        >
          {loading ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
        {!ready && (
          <p className="text-xs text-foreground/70 text-center">
            Open this page from the password reset email link.
          </p>
        )}
      </form>
    </main>
  );
};

export default ResetPassword;
