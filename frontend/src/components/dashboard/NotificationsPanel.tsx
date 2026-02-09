import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, type AppNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

export default function NotificationsPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let isActive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isActive) return;
      setUserId(user?.id ?? null);
    })();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    setNotifications(getNotifications(userId));
    const handler = () => setNotifications(getNotifications(userId));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [userId]);

  const recent = useMemo(() => notifications.slice(0, 4), [notifications]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 shadow-glow-sm">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        <Link
          to="/transactions"
          className="text-xs text-primary hover:text-primary-glow transition-colors"
        >
          View →
        </Link>
      </div>

      <div className="space-y-3">
        {recent.length === 0 && (
          <div className="text-xs text-muted-foreground">
            No notifications yet.
          </div>
        )}
        {recent.map((note) => (
          <div key={note.id} className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
            <p className="text-foreground font-medium">{note.title}</p>
            <p className="mt-1">{note.message}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {new Date(note.createdAt).toLocaleString("en-UG")}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
