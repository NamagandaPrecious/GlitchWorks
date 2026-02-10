/**
 * Spending Forecasting Model
 * Simulates a trained LSTM/Time Series model for spending predictions
 */

import type { TrainingTransaction } from "../training-data";
import { trainedAverages, trainedSeasonality } from "./artifacts/spending-forecaster";

export interface SpendingForecast {
  predictedAmount: number;
  confidenceInterval: { lower: number; upper: number };
  trend: "increasing" | "decreasing" | "stable";
  trendStrength: number; // 0-1
  seasonalFactor: number;
  daysUntilDepletion: number;
  depletionDate: string;
  riskLevel: "low" | "medium" | "high";
  dataQuality?: "low" | "medium" | "high";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function winsorize(values: number[], lowerPct = 0.05, upperPct = 0.95) {
  if (values.length < 5) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const lowerIndex = Math.floor(sorted.length * lowerPct);
  const upperIndex = Math.ceil(sorted.length * upperPct) - 1;
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  return values.map((value) => Math.min(Math.max(value, lower), upper));
}

/**
 * Simulated trained LSTM model for spending forecasting
 * Uses historical patterns to predict future spending
 */
export function forecastSpending(
  category: string,
  historicalTransactions: TrainingTransaction[],
  currentAllocated: number,
  currentSpent: number,
  daysInPeriod: number = 30
): SpendingForecast {
  // Filter transactions for this category
  const categoryTx = historicalTransactions.filter(
    (tx) => tx.category === category && tx.type === "expense"
  );
  
  if (categoryTx.length === 0) {
    // No history - use default prediction
    const safeAllocated = Math.max(currentAllocated, 0);
    const safeSpent = Math.max(Math.abs(currentSpent), 0);
    const trainedAverage = trainedAverages[category];
    const fallbackMonthly = trainedAverage && trainedAverage > 0 ? trainedAverage : safeSpent;
    const dailySpending = fallbackMonthly > 0 ? fallbackMonthly / daysInPeriod : 0;
    const remaining = safeAllocated - safeSpent;
    const daysUntilDepletion = dailySpending > 0 ? remaining / dailySpending : daysInPeriod;
    const safeDays = Math.max(0, Math.round(daysUntilDepletion));
    const month = new Date().getMonth() + 1;
    const trainedSeason = trainedSeasonality[category]?.[month];
    const seasonalFactor = trainedSeason ?? 1.0;
    return {
      predictedAmount: Math.max(fallbackMonthly, 0),
      confidenceInterval: {
        lower: Math.max(fallbackMonthly * 0.8, 0),
        upper: Math.max(fallbackMonthly * 1.2, 0),
      },
      trend: "stable",
      trendStrength: 0,
      seasonalFactor,
      daysUntilDepletion: safeDays,
      depletionDate: new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString(),
      riskLevel: "medium",
      dataQuality: "low",
    };
  }
  
  // Calculate average daily spending (winsorized to reduce outlier bias)
  const amounts = winsorize(categoryTx.map((tx) => Math.abs(tx.amount)));
  const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0);
  const transactionCount = categoryTx.length;
  const averageTransaction = totalSpent / Math.max(transactionCount, 1);
  
  // Calculate spending velocity (transactions per day)
  const dates = categoryTx.map((tx) => new Date(tx.date).getTime()).sort();
  const timeSpan = dates.length > 1 ? (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24) : 30;
  const transactionsPerDay = transactionCount / Math.max(timeSpan, 1);
  const dataQualityScore = clamp(
    0.3 + Math.min(transactionCount / 12, 1) * 0.4 + Math.min(timeSpan / 90, 1) * 0.3,
    0.3,
    1
  );
  const dataQuality =
    transactionCount >= 12 && timeSpan >= 60
      ? "high"
      : transactionCount >= 6
        ? "medium"
        : "low";
  
  // Predict monthly spending (simulates LSTM output)
  const baseMonthlySpending = averageTransaction * transactionsPerDay * 30;
  
  // Calculate trend (simulates trend analysis)
  const recentTx = categoryTx.slice(-5);
  const olderTx = categoryTx.slice(-10, -5);
  const recentAvg = recentTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / Math.max(recentTx.length, 1);
  const olderAvg = olderTx.length > 0
    ? olderTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / olderTx.length
    : recentAvg;
  const trendChangeRaw = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  const trendChange = transactionCount < 6 ? 0 : trendChangeRaw;
  let trend: "increasing" | "decreasing" | "stable" = "stable";
  if (trendChange > 0.1) trend = "increasing";
  else if (trendChange < -0.1) trend = "decreasing";
  
  // Apply trend to prediction
  let predictedAmount = baseMonthlySpending;
  if (trend === "increasing") {
    predictedAmount *= (1 + Math.min(trendChange, 0.3)); // Cap at 30% increase
  } else if (trend === "decreasing") {
    predictedAmount *= (1 + Math.max(trendChange, -0.2)); // Cap at 20% decrease
  }
  
  // Seasonal factor (simulates seasonal pattern recognition)
  const currentMonth = new Date().getMonth();
  const seasonalMultipliers: Record<number, number> = {
    11: 1.15, // December - holiday spending
    0: 1.1,  // January - new year
    9: 1.05, // October - pre-holiday
  };
  const trainedSeason = trainedSeasonality[category]?.[currentMonth + 1];
  const seasonalFactor = trainedSeason ?? (seasonalMultipliers[currentMonth] || 1.0);
  predictedAmount *= seasonalFactor;

  if (dataQualityScore < 0.7) {
    const blend = dataQualityScore;
    predictedAmount =
      predictedAmount * blend + Math.max(Math.abs(currentSpent), 0) * (1 - blend);
  }
  
  // Confidence interval (simulates model uncertainty)
  const variance = calculateVariance(amounts);
  const stdDev = Math.sqrt(variance);
  const uncertaintyBoost = dataQualityScore < 0.6 ? 1.25 : dataQualityScore < 0.8 ? 1.1 : 1;
  const confidenceMargin = stdDev * 1.96 * uncertaintyBoost; // 95% confidence
  
  // Calculate days until depletion
  const safeAllocated = Math.max(currentAllocated, 0);
  const safeSpent = Math.max(Math.abs(currentSpent), 0);
  const remaining = safeAllocated - safeSpent;
  const dailySpending = predictedAmount > 0 ? predictedAmount / 30 : 0;
  const daysUntilDepletion = dailySpending > 0 ? remaining / dailySpending : daysInPeriod;
  
  // Risk assessment
  let riskLevel: "low" | "medium" | "high" = "medium";
  const utilizationRate = safeAllocated > 0 ? safeSpent / safeAllocated : 0;
  if (utilizationRate > 0.8 || daysUntilDepletion < 7) {
    riskLevel = "high";
  } else if (utilizationRate < 0.5 && daysUntilDepletion > 20) {
    riskLevel = "low";
  }
  
  const roundedPrediction = Math.max(0, Math.round(predictedAmount));
  const lowerBound = Math.max(0, Math.round(predictedAmount - confidenceMargin));
  const upperBound = Math.max(0, Math.round(predictedAmount + confidenceMargin));

  const safeDaysUntilDepletion = Math.max(0, Math.round(daysUntilDepletion));

  return {
    predictedAmount: roundedPrediction,
    confidenceInterval: {
      lower: lowerBound,
      upper: Math.max(upperBound, lowerBound),
    },
    trend,
    trendStrength: Math.abs(trendChange),
    seasonalFactor,
    daysUntilDepletion: safeDaysUntilDepletion,
    depletionDate: new Date(Date.now() + safeDaysUntilDepletion * 24 * 60 * 60 * 1000).toISOString(),
    riskLevel,
    dataQuality,
  };
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Forecast spending for multiple categories
 */
export function forecastMultipleCategories(
  categories: string[],
  historicalTransactions: TrainingTransaction[],
  allocations: Record<string, { allocated: number; spent: number }>
): Record<string, SpendingForecast> {
  const forecasts: Record<string, SpendingForecast> = {};
  
  categories.forEach((category) => {
    const allocation = allocations[category] || { allocated: 0, spent: 0 };
    forecasts[category] = forecastSpending(
      category,
      historicalTransactions,
      allocation.allocated,
      allocation.spent
    );
  });
  
  return forecasts;
}

