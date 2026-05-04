import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? null));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast("Signed out", { description: "You have been logged out." });
  };

  const name = displayName ?? user?.email ?? "";
  const initial = (name.charAt(0) || "?").toUpperCase();

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">
      <div className="bg-orb w-[500px] h-[500px] -top-32 -left-32" style={{ background: "hsl(280 70% 50%)" }} />
      <div className="bg-orb w-[400px] h-[400px] top-1/3 -right-24" style={{ background: "hsl(340 80% 55%)" }} />
      <div className="bg-orb w-[450px] h-[450px] -bottom-32 left-1/4" style={{ background: "hsl(220 70% 55%)" }} />

      <div className="relative z-10 glass-card w-full max-w-sm rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-2">
          {initial !== "?" ? (
            <span className="text-4xl font-semibold text-foreground/90">{initial}</span>
          ) : (
            <User className="w-12 h-12 text-foreground/70" strokeWidth={1.5} />
          )}
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold tracking-wide">Welcome back{displayName ? `, ${displayName}` : ""}</h1>
          <p className="text-sm text-foreground/80 break-all">{user?.email}</p>
        </div>

        <div className="w-full h-px bg-foreground/20" />

        <p className="text-xs text-center text-foreground/70 leading-relaxed">
          You're signed in with a secure session. <br />
          Click logout to end your session.
        </p>

        <button
          onClick={handleLogout}
          className="gradient-button w-full rounded-full py-3 text-sm font-semibold tracking-[0.2em] text-primary-foreground mt-2 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          LOGOUT
        </button>
      </div>
    </main>
  );
};

export default Index;
