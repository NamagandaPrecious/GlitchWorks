/**
 * Onboarding survey types and helpers for use on dashboard and elsewhere.
 */

export interface OnboardingAnswers {
  lifeStage?: string;
  lifeStageCustom?: string;
  dependants?: string;
  incomePattern?: string;
  incomePatternCustom?: string;
  essentialCategories?: string[];
  topSpendingCategories?: string[];
  plannedExpenses?: string;
  plannedExpensesCustom?: string;
  savingsGoal?: string;
  savingsGoalCustom?: string;
  willingToCutBack?: string[];
  budgetInMind?: string;
  expectedAmounts?: Record<string, number>;
  alertPreference?: string;
}

const LIFE_STAGE_LABELS: Record<string, string> = {
  student: "Student",
  young_professional: "Young professional",
  supporting_family: "Supporting family",
  pre_retirement: "Pre-retirement",
  retired: "Retired",
  custom: "Custom",
};

const SAVINGS_GOAL_LABELS: Record<string, string> = {
  none: "No specific goal",
  emergency: "Emergency fund",
  big_purchase: "Big purchase (e.g. car, home)",
  retirement: "Retirement",
  pay_debt: "Paying off debt",
  custom: "Custom",
};

const ALERT_PREFERENCE_LABELS: Record<string, string> = {
  strict: "Strict alerts when over limit",
  big_only: "Warn only on big overruns",
  use_profile: "Use my profile; rarely warn",
  inform_only: "Inform only, don't warn",
};

export function getLifeStageLabel(answers: OnboardingAnswers): string | null {
  if (!answers.lifeStage) return null;
  if (answers.lifeStage === "custom" && answers.lifeStageCustom) {
    return answers.lifeStageCustom.trim();
  }
  return LIFE_STAGE_LABELS[answers.lifeStage] ?? answers.lifeStage;
}

export function getSavingsGoalLabel(answers: OnboardingAnswers): string | null {
  if (!answers.savingsGoal) return null;
  if (answers.savingsGoal === "custom" && answers.savingsGoalCustom) {
    return answers.savingsGoalCustom.trim();
  }
  return SAVINGS_GOAL_LABELS[answers.savingsGoal] ?? answers.savingsGoal;
}

export function getAlertPreferenceLabel(answers: OnboardingAnswers): string | null {
  if (!answers.alertPreference) return null;
  return ALERT_PREFERENCE_LABELS[answers.alertPreference] ?? answers.alertPreference;
}

/** Whether the user asked to use their profile so we rarely warn about overspend */
export function shouldUseProfileForAlerts(answers: OnboardingAnswers): boolean {
  return answers.alertPreference === "use_profile";
}

/** Categories the user marked as essential — overspend on these can be treated more softly */
export function getEssentialCategories(answers: OnboardingAnswers): string[] {
  return answers.essentialCategories ?? [];
}

const PLANNED_EXPENSE_LABELS: Record<string, string> = {
  none: "",
  wedding_event: "Wedding or event",
  medical: "Medical",
  education: "Education",
  travel: "Travel",
  home_car: "Home or car",
  other: "Other",
  custom: "",
};

/** Suggested goal name from savings goal (for dashboard and Goals page) */
export function getSuggestedGoalNameFromSurvey(answers: OnboardingAnswers): string | null {
  const savings = getSavingsGoalLabel(answers);
  if (savings && savings !== "No specific goal") return savings;
  return null;
}

/** Planned expense as a goal suggestion (e.g. "Education", "Wedding") */
export function getPlannedExpenseGoalSuggestion(answers: OnboardingAnswers): string | null {
  if (!answers.plannedExpenses) return null;
  if (answers.plannedExpenses === "custom" && answers.plannedExpensesCustom?.trim()) {
    return answers.plannedExpensesCustom.trim();
  }
  const label = PLANNED_EXPENSE_LABELS[answers.plannedExpenses];
  return label || null;
}

/** All goal-related suggestions from survey: [savings goal, planned expense] for display */
export function getGoalSuggestionsFromSurvey(answers: OnboardingAnswers): { label: string; type: "savings" | "planned" }[] {
  const out: { label: string; type: "savings" | "planned" }[] = [];
  const savings = getSuggestedGoalNameFromSurvey(answers);
  if (savings) out.push({ label: savings, type: "savings" });
  const planned = getPlannedExpenseGoalSuggestion(answers);
  if (planned) out.push({ label: planned, type: "planned" });
  return out;
}
