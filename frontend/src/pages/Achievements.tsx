import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  PiggyBank,
  Award,
  Lock,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  category: "savings" | "goals" | "spending" | "streak" | "milestone";
  points: number;
  unlocked: boolean;
  progress?: number;
  target?: number;
  unlockedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first transaction",
    icon: CheckCircle,
    category: "milestone",
    points: 10,
    unlocked: true,
    unlockedDate: "2026-01-05",
    rarity: "common",
  },
  {
    id: "2",
    title: "Goal Getter",
    description: "Complete your first financial goal",
    icon: Target,
    category: "goals",
    points: 50,
    unlocked: true,
    unlockedDate: "2026-01-15",
    rarity: "rare",
  },
  {
    id: "3",
    title: "Savings Master",
    description: "Save UGX 100,000 in total",
    icon: PiggyBank,
    category: "savings",
    points: 100,
    unlocked: true,
    unlockedDate: "2026-01-20",
    rarity: "epic",
  },
  {
    id: "4",
    title: "Budget Warrior",
    description: "Stay within budget for 30 consecutive days",
    icon: Zap,
    category: "streak",
    points: 75,
    unlocked: false,
    progress: 18,
    target: 30,
    rarity: "rare",
  },
  {
    id: "5",
    title: "Flux Pod Master",
    description: "Create and manage 5 flux pods",
    icon: Zap,
    category: "milestone",
    points: 60,
    unlocked: true,
    unlockedDate: "2026-01-10",
    rarity: "rare",
  },
  {
    id: "6",
    title: "Millionaire",
    description: "Reach UGX 10,000,000 net worth",
    icon: TrendingUp,
    category: "milestone",
    points: 200,
    unlocked: false,
    progress: 8500000,
    target: 10000000,
    rarity: "legendary",
  },
  {
    id: "7",
    title: "Consistent Saver",
    description: "Save money for 60 days straight",
    icon: Star,
    category: "streak",
    points: 150,
    unlocked: false,
    progress: 42,
    target: 60,
    rarity: "epic",
  },
  {
    id: "8",
    title: "Goal Crusher",
    description: "Complete 5 financial goals",
    icon: Award,
    category: "goals",
    points: 120,
    unlocked: false,
    progress: 3,
    target: 5,
    rarity: "epic",
  },
  {
    id: "9",
    title: "Smart Spender",
    description: "Reduce expenses by 20% for a month",
    icon: TrendingUp,
    category: "spending",
    points: 80,
    unlocked: false,
    progress: 12,
    target: 20,
    rarity: "rare",
  },
  {
    id: "10",
    title: "Nexus Explorer",
    description: "Use all features of UniGuard Wallet",
    icon: Sparkles,
    category: "milestone",
    points: 90,
    unlocked: false,
    progress: 6,
    target: 8,
    rarity: "rare",
  },
];

const rarityConfig = {
  common: {
    color: "text-muted-foreground",
    bg: "bg-muted/20",
    border: "border-muted",
    glow: "",
  },
  rare: {
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    glow: "shadow-glow-sm",
  },
  epic: {
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    glow: "shadow-glow-secondary",
  },
  legendary: {
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
    glow: "shadow-glow-warning",
  },
};

function formatProgressValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);
const unlockedCount = achievements.filter((a) => a.unlocked).length;
const completionRate = (unlockedCount / achievements.length) * 100;

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const config = rarityConfig[achievement.rarity];
  const Icon = achievement.icon;
  const progressPercentage = achievement.progress && achievement.target
    ? (achievement.progress / achievement.target) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 relative overflow-hidden",
        achievement.unlocked ? "hover:glass-card-glow" : "opacity-75",
        config.glow
      )}
    >
      {/* Lock badge for locked achievements - corner only so progress stays visible */}
      {!achievement.unlocked && (
        <div className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-lg bg-muted/90 border border-border">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Rarity indicator */}
      <div className={cn("absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full", config.bg, config.border, "border-2")} />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("p-3 rounded-xl border shrink-0", config.bg, config.border)}>
          <Icon className={cn("w-6 h-6", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={cn("font-display text-lg font-semibold mb-1", achievement.unlocked ? "text-foreground" : "text-muted-foreground")}>
                {achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
            {achievement.unlocked && (
              <div className="shrink-0 ml-2">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            )}
          </div>

          {/* Progress bar for locked achievements */}
          {!achievement.unlocked && achievement.progress !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span className="font-mono">
                  {formatProgressValue(achievement.progress!)} / {formatProgressValue(achievement.target!)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", config.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Unlocked date */}
          {achievement.unlocked && achievement.unlockedDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString("en-UG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {/* Points */}
          <div className="flex items-center gap-2 mt-3">
            <Star className={cn("w-4 h-4", config.color)} />
            <span className={cn("font-mono text-sm font-bold", config.color)}>
              {achievement.points} pts
            </span>
            <span className="text-xs text-muted-foreground ml-auto capitalize">
              {achievement.rarity}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Achievements() {
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <AppLayout>
      <div className="min-h-screen p-6 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shadow-glow-warning">
                <Trophy className="w-6 h-6 text-accent-foreground" />
              </div>
              Achievements
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your financial milestones and earn rewards
            </p>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Points</p>
            <p className="font-mono text-2xl font-bold text-accent">{totalPoints}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Unlocked</p>
            <p className="font-mono text-2xl font-bold text-success">
              {unlockedCount}/{achievements.length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completion</p>
            <p className="font-mono text-2xl font-bold text-primary">
              {completionRate.toFixed(0)}%
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Next Level</p>
            <p className="font-mono text-2xl font-bold text-foreground">Level 5</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-mono text-muted-foreground">{completionRate.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Unlocked ({unlockedAchievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Locked ({lockedAchievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lockedAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  index={unlockedAchievements.length + index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

