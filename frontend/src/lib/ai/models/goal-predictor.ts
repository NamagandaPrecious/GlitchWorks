/**
 * Goal Achievement Prediction Model
 * Simulates a trained regression + Monte Carlo model for goal predictions
 */

import type { TrainingTransaction } from "../training-data";
import { trainedSavingsRates } from "./artifacts/goal-predictor";

export interface GoalPrediction {
  completionProbability: number; // 0-1
  predictedCompletionDate: string;
  confidenceInterval: { lower: string; upper: string };
  recommendedContribution: number;
  riskFactors: string[];
  successLikelihood: "very-high" | "high" | "medium" | "low" | "very-low";
  monthsToComplete: number;
  accelerationOpportunities: Array<{
    action: string;
    impact: number; // days saved
    confidence: number;
  }>;
  dataQuality?: "low" | "medium" | "high";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTrainedSavingsRate(annualIncome: number) {
  if (!Number.isFinite(annualIncome) || annualIncome <= 0) {
    return 0;
  }
  if (annualIncome < 20000) return trainedSavingsRates["<20k"] || 0;
  if (annualIncome < 50000) return trainedSavingsRates["20-50k"] || 0;
  if (annualIncome < 100000) return trainedSavingsRates["50-100k"] || 0;
  if (annualIncome < 200000) return trainedSavingsRates["100-200k"] || 0;
  if (annualIncome < 500000) return trainedSavingsRates["200-500k"] || 0;
  return trainedSavingsRates["500k+"] || 0;
}

/**
 * Simulated trained model for goal achievement prediction
 * Uses historical patterns + Monte Carlo simulation
 */
export function predictGoalAchievement(
  goal: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string;
  },
  historicalTransactions: TrainingTransaction[],
  monthlyIncome: number,
  activeGoals: Array<{ monthlyContribution: number }>
): GoalPrediction {
  const remaining = goal.targetAmount - goal.currentAmount;
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const txDates = historicalTransactions.map((tx) => new Date(tx.date).getTime());
  const timeSpan = txDates.length > 0
    ? (Math.max(...txDates) - Math.min(...txDates)) / (1000 * 60 * 60 * 24)
    : 0;
  const timeSpanDays = Math.max(timeSpan, 1);
  const dataQualityScore = clamp(
    0.3 + Math.min(historicalTransactions.length / 20, 1) * 0.4 + Math.min(timeSpanDays / 90, 1) * 0.3,
    0.3,
    1
  );
  const dataQuality =
    historicalTransactions.length >= 20 && timeSpanDays >= 60
      ? "high"
      : historicalTransactions.length >= 10
        ? "medium"
        : "low";

  if (remaining <= 0) {
    return {
      completionProbability: 1,
      predictedCompletionDate: now.toISOString(),
      confidenceInterval: { lower: now.toISOString(), upper: now.toISOString() },
      recommendedContribution: 0,
      riskFactors: [],
      successLikelihood: "very-high",
      monthsToComplete: 0,
      accelerationOpportunities: [],
      dataQuality: "high",
    };
  }
  
  // Calculate required monthly contribution
  const monthsUntilDeadline = Math.max(daysUntilDeadline / 30, 1 / 30);
  const requiredMonthly = remaining / monthsUntilDeadline;
  
  // Base prediction (simulates regression model)
  const currentContribution = goal.monthlyContribution;
  const monthsAtCurrentRate = currentContribution > 0 ? remaining / currentContribution : Number.POSITIVE_INFINITY;
  const baseMonths = Number.isFinite(monthsAtCurrentRate) ? monthsAtCurrentRate : monthsUntilDeadline * 2;
  const predictedCompletionDate = new Date(
    now.getTime() + baseMonths * 30 * 24 * 60 * 60 * 1000
  );
  
  // Calculate probability using Monte Carlo simulation (simulated)
  const simulations = 1000;
  let successCount = 0;

  const hashSeed = (input: string) => {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  };

  const mulberry32 = (seed: number) => {
    let t = seed;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const seedInput = `${goal.name}|${goal.targetAmount}|${goal.currentAmount}|${goal.deadline}|${goal.monthlyContribution}`;
  const rng = mulberry32(hashSeed(seedInput));
  
  // Simulate various scenarios
  for (let i = 0; i < simulations; i++) {
    // Add randomness to contribution (simulates income variability)
    const variability = 0.1; // 10% variability
    const simulatedContribution = currentContribution * (1 + (rng() - 0.5) * variability * 2);
    
    // Simulate spending changes affecting savings
    const spendingVariability = 0.05; // 5% spending variability
    const effectiveContribution = simulatedContribution * (1 - (rng() - 0.5) * spendingVariability * 2);
    
    const simulatedMonths = remaining / Math.max(effectiveContribution, currentContribution * 0.5);
    const simulatedCompletion = new Date(now.getTime() + simulatedMonths * 30 * 24 * 60 * 60 * 1000);
    
    if (simulatedCompletion <= deadline) {
      successCount++;
    }
  }
  
  const rawProbability = currentContribution > 0 ? successCount / simulations : 0;
  const qualityWeight = 0.7 + dataQualityScore * 0.3;
  const completionProbability = rawProbability * qualityWeight + 0.5 * (1 - qualityWeight);
  
  // Calculate confidence interval (simulates prediction intervals)
  const stdDev = baseMonths * 0.15; // 15% standard deviation
  const lowerMonths = Math.max(0, baseMonths - 1.96 * stdDev);
  const upperMonths = Math.max(lowerMonths, baseMonths + 1.96 * stdDev);
  
  const confidenceInterval = {
    lower: new Date(now.getTime() + lowerMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
    upper: new Date(now.getTime() + upperMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  // Risk factors
  const riskFactors: string[] = [];
  if (currentContribution < requiredMonthly * 0.9) {
    riskFactors.push("Current contribution is below required rate");
  }
  if (completionProbability < 0.7) {
    riskFactors.push("Low probability of on-time completion");
  }
  if (daysUntilDeadline < 60 && remaining > goal.currentAmount) {
    riskFactors.push("Tight deadline with significant remaining amount");
  }
  if (currentContribution <= 0) {
    riskFactors.push("No active monthly contribution");
  }
  if (daysUntilDeadline <= 0) {
    riskFactors.push("Deadline has already passed");
  }
  if (dataQuality === "low") {
    riskFactors.push("Limited historical data reduces prediction confidence");
  }
  
  // Recommended contribution (simulates optimization)
  const totalGoalContributions = activeGoals.reduce(
    (sum, goalItem) => sum + goalItem.monthlyContribution,
    0
  );
  const otherGoalsContribution = Math.max(totalGoalContributions - goal.monthlyContribution, 0);
  const affordabilityCap = monthlyIncome > 0
    ? Math.max(monthlyIncome - otherGoalsContribution, 0) * 0.7
    : Number.POSITIVE_INFINITY;
  const trainedSavingsRate = getTrainedSavingsRate(monthlyIncome * 12);
  const trainedBaseline = trainedSavingsRate > 0 ? monthlyIncome * trainedSavingsRate : 0;
  const rawRecommendation = Math.max(
    requiredMonthly * 1.1, // 10% buffer
    currentContribution * 1.05, // At least 5% increase
    trainedBaseline * 0.9
  );
  const recommendedContribution = Math.min(rawRecommendation, affordabilityCap);
  if (recommendedContribution < rawRecommendation) {
    riskFactors.push("Recommended contribution limited by affordability");
  }
  if (trainedBaseline > 0 && currentContribution <= 0) {
    riskFactors.push("Recommendation uses trained savings baseline");
  }
  
  // Success likelihood
  let successLikelihood: "very-high" | "high" | "medium" | "low" | "very-low";
  if (completionProbability >= 0.9) successLikelihood = "very-high";
  else if (completionProbability >= 0.75) successLikelihood = "high";
  else if (completionProbability >= 0.5) successLikelihood = "medium";
  else if (completionProbability >= 0.25) successLikelihood = "low";
  else successLikelihood = "very-low";
  
  // Acceleration opportunities (simulates spending analysis)
  const accelerationOpportunities: Array<{ action: string; impact: number; confidence: number }> = [];
  
  // Analyze spending patterns for savings opportunities
  const categorySpending: Record<string, number> = {};
  historicalTransactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
    });
  
  // Find top spending categories that could be reduced
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  topCategories.forEach(([category, amount]) => {
    const monthlyAmount = (amount / timeSpanDays) * 30; // Estimate monthly
    const potentialSavings = monthlyAmount * 0.2; // 20% reduction
    const daysSaved = (potentialSavings / recommendedContribution) * 30;
    
    if (daysSaved > 5) { // Only suggest if saves more than 5 days
      accelerationOpportunities.push({
        action: `Reduce ${category} spending by 20%`,
        impact: Math.round(daysSaved),
        confidence: 0.7,
      });
    }
  });
  
  return {
    completionProbability,
    predictedCompletionDate: predictedCompletionDate.toISOString(),
    confidenceInterval,
    recommendedContribution: Math.round(recommendedContribution),
    riskFactors,
    successLikelihood,
    monthsToComplete: Math.round(baseMonths * 10) / 10,
    accelerationOpportunities,
    dataQuality,
  };
}

/**
 * Predict multiple goals
 */
export function predictMultipleGoals(
  goals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string;
  }>,
  historicalTransactions: TrainingTransaction[],
  monthlyIncome: number
): Record<string, GoalPrediction> {
  const predictions: Record<string, GoalPrediction> = {};
  
  goals.forEach((goal) => {
    predictions[goal.name] = predictGoalAchievement(
      goal,
      historicalTransactions,
      monthlyIncome,
      goals.map((g) => ({ monthlyContribution: g.monthlyContribution }))
    );
  });
  
  return predictions;
}

