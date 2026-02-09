import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Protects app routes: redirects to /auth if not logged in,
 * and to /onboarding only if the user has never completed the one-time survey
 * (stored in profiles.onboarding_completed_at). Once completed, they are never
 * asked again on sign-in.
 */
export default function RequireOnboarding({ children }: RequireOnboardingProps) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!isActive) return;
      if (error || !user) {
        navigate("/auth", { replace: true });
        return;
      }
      // Session flag: user completed onboarding this session (so we don't redirect on every route)
      const sessionCompleted = typeof window !== "undefined" && sessionStorage.getItem("onboarding_completed") === "1";
      if (sessionCompleted) {
        setReady(true);
        return;
      }
      // One-time flag right after submit (avoids read-after-write before DB is visible)
      const justCompleted = typeof window !== "undefined" && sessionStorage.getItem("onboarding_just_completed") === "1";
      if (justCompleted) {
        try {
          sessionStorage.removeItem("onboarding_just_completed");
          sessionStorage.setItem("onboarding_completed", "1");
        } catch {}
        setReady(true);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();
      if (!isActive) return;
      if (profile?.onboarding_completed_at) {
        try {
          sessionStorage.setItem("onboarding_completed", "1");
        } catch {}
        setReady(true);
        return;
      }
      navigate("/onboarding", { replace: true });
    })();
    return () => {
      isActive = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
