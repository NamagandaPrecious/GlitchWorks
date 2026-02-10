import { aiService } from "./ai-service";
import type { TrainingTransaction } from "./training-data";

export interface CompanionGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline: string;
}

export interface CompanionContext {
  goals?: CompanionGoal[];
  lastUserMessage?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Math.max(amount, 0));
}

function buildSpendingSummary(detailed = false): string {
  const insights = aiService.getDashboardInsights();
  if (insights.transactionCount === 0) {
    return "I don't have enough transaction data yet. Add a few transactions (or open the Transactions page to load your data), and I can analyze your spending patterns.";
  }

  const top = insights.topCategories.slice(0, detailed ? 5 : 3);
  const topText =
    top.length > 0
      ? top.map((item) => `${item.category} (${item.percentage}%)`).join(", ")
      : "no dominant categories yet";

  const lines = [
    `Based on your recent data, your top spending categories are ${topText}.`,
    `Total spending: ${formatCurrency(insights.totalSpending)} across ${insights.transactionCount} transactions.`,
  ];
  if (detailed && top.length > 0) {
    lines.push(
      "Breakdown: " +
        top.map((item) => `${item.category} ${formatCurrency(item.amount)}`).join("; ") +
        "."
    );
  }
  lines.push("If you'd like, I can give budget tips or goal recommendations.");
  return lines.join("\n");
}

function buildBudgetTips(): string {
  const insights = aiService.getDashboardInsights();
  const savingsRate = Math.max(0, insights.savingsRate);
  const top = insights.topCategories.slice(0, 2);
  const topTip =
    top.length > 0
      ? `Focus on ${top.map((item) => item.category).join(" and ")} to find quick savings.`
      : "Track two categories consistently for a week to identify easy wins.";

  const suggestion = aiService.suggestBudgetAllocation(
    Math.max(0, insights.totalIncome - insights.totalSpending),
    {},
    []
  );
  const suggestedCategories =
    suggestion?.allocations && suggestion.allocations.length > 0
      ? suggestion.allocations
          .slice(0, 3)
          .map((a) => `${a.category}: ${formatCurrency(a.suggestedAmount)}`)
          .join("; ")
      : null;

  const lines = [
    `Your current savings rate is ${savingsRate}%.`,
    topTip,
    "Try setting a weekly cap for discretionary categories and review mid‑week to stay on track.",
  ];
  if (suggestedCategories) {
    lines.push(`Suggested allocation for surplus: ${suggestedCategories}`);
  }
  return lines.join("\n");
}

function buildHealthSummary(): string {
  const insights = aiService.getDashboardInsights();
  if (insights.totalIncome <= 0) {
    return "I need at least one income entry to estimate your financial health score. Add income transactions so I can give you a score.";
  }

  const savingsRate = Math.max(0, insights.savingsRate);
  const score = Math.min(95, Math.max(35, 50 + Math.round(savingsRate * 0.6)));
  return [
    `Your financial health score is ${score}/100.`,
    `Savings rate: ${savingsRate}%.`,
    "Keep income and expense entries up to date for more precise insights.",
  ].join("\n");
}

function buildGoalResponse(context?: CompanionContext): string {
  const goals = context?.goals ?? [];
  if (goals.length === 0) {
    return [
      "I can run goal predictions once you add goals with a target, deadline, and monthly contribution.",
      "Add a goal and I'll estimate completion probability with a confidence range.",
    ].join("\n");
  }

  const activeGoals = goals.map((g) => ({ monthlyContribution: g.monthlyContribution }));
  const lines: string[] = ["Here’s your goal outlook:"];
  for (const goal of goals) {
    const prediction = aiService.predictGoal(
      {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        monthlyContribution: goal.monthlyContribution,
        deadline: goal.deadline,
      },
      activeGoals
    );
    const pct = Math.round(prediction.completionProbability * 100);
    lines.push(
      `• ${goal.name}: ${prediction.successLikelihood} (${pct}% completion probability, ~${prediction.monthsToComplete} months to target).`
    );
  }
  lines.push("Keep contributions steady or increase them to improve likelihood.");
  return lines.join("\n");
}

function matchIntent(input: string, phrases: string[]): boolean {
  const lower = input.toLowerCase().trim();
  return phrases.some((p) => lower.includes(p.toLowerCase()));
}

export function buildAiResponse(
  input: string,
  context?: CompanionContext
): { content: string; suggestions: string[] } {
  const lowerInput = input.toLowerCase().trim();
  const last = context?.lastUserMessage?.toLowerCase().trim() ?? "";

  const spendingPhrases = [
    "spend",
    "expense",
    "expenses",
    "spending",
    "how much did i spend",
    "where did my money go",
    "analyze my spending",
    "top categories",
    "spending patterns",
    "breakdown",
    "categories",
  ];
  const goalPhrases = [
    "goal",
    "target",
    "targets",
    "will i reach",
    "goal progress",
    "savings goal",
    "on track",
    "recommendations for goals",
  ];
  const budgetPhrases = [
    "budget",
    "tip",
    "tips",
    "optimize",
    "save more",
    "allocation",
    "allocate",
    "savings",
  ];
  const healthPhrases = [
    "health",
    "score",
    "financial health",
    "how am i doing",
    "overall",
  ];
  const followUpPhrases = ["tell me more", "dig deeper", "more detail", "breakdown", "elaborate"];

  const isFollowUp = matchIntent(lowerInput, followUpPhrases) && last.length > 0;
  const isSpendingLast = matchIntent(last, spendingPhrases);

  if (isFollowUp && isSpendingLast) {
    return {
      content: buildSpendingSummary(true),
      suggestions: ["Budget tips", "Goal progress", "Health score"],
    };
  }

  if (matchIntent(lowerInput, spendingPhrases)) {
    return {
      content: buildSpendingSummary(false),
      suggestions: ["Show budget tips", "Analyze a category", "Goal progress"],
    };
  }

  if (matchIntent(lowerInput, goalPhrases)) {
    return {
      content: buildGoalResponse(context),
      suggestions: ["Spending analysis", "Budget tips", "Health score"],
    };
  }

  if (matchIntent(lowerInput, budgetPhrases)) {
    return {
      content: buildBudgetTips(),
      suggestions: ["Spending analysis", "Health score", "Goal progress"],
    };
  }

  if (matchIntent(lowerInput, healthPhrases)) {
    return {
      content: buildHealthSummary(),
      suggestions: ["Spending analysis", "Budget tips", "Goal progress"],
    };
  }

  return {
    content: [
      "I can help analyze spending, budgets, and goals using your data.",
      "Ask about spending trends, budget tips, goal progress, or your financial health score.",
    ].join("\n"),
    suggestions: ["Spending analysis", "Budget tips", "Goal progress", "Financial health"],
  };
}
