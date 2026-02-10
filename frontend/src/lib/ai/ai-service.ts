/**
 * AI Service Layer
 * Centralized service for all AI model predictions
 * This acts as the interface between the UI and trained models
 */

import { categorizeTransaction, type CategorizationResult } from "./models/transaction-categorizer";
import { forecastSpending, type SpendingForecast } from "./models/spending-forecaster";
import { suggestBudgetAllocation, suggestNewPodAllocation, type AllocationRecommendation, type BudgetAllocation } from "./models/budget-allocator";
import { predictGoalAchievement, type GoalPrediction } from "./models/goal-predictor";
import { detectAnomaly, type AnomalyResult } from "./models/anomaly-detector";
import type { TrainingTransaction } from "./training-data";

/**
 * Main AI Service class
 * Provides unified interface for all AI predictions
 */
export class AIService {
  private historicalTransactions: TrainingTransaction[] = [];
  private monthlyIncome: number = 0;

  /**
   * Initialize AI service with user data
   */
  initialize(transactions: TrainingTransaction[], income: number) {
    this.historicalTransactions = transactions;
    this.monthlyIncome = income;
  }

  /**
   * Categorize a transaction using trained model
   */
  categorizeTransaction(
    description: string,
    amount: number,
    merchant?: string,
    transactionType?: "income" | "expense"
  ): CategorizationResult {
    return categorizeTransaction(
      description,
      amount,
      merchant,
      this.historicalTransactions,
      transactionType
    );
  }

  /**
   * Forecast spending for a category
   */
  forecastSpending(
    category: string,
    allocated: number,
    spent: number,
    daysInPeriod: number = 30
  ): SpendingForecast {
    return forecastSpending(
      category,
      this.historicalTransactions,
      allocated,
      spent,
      daysInPeriod
    );
  }

  /**
   * Suggest budget allocation
   */
  suggestBudgetAllocation(
    availableBudget: number,
    currentAllocations: Record<string, number>,
    activeGoals: Array<{ name: string; monthlyContribution: number }>
  ): AllocationRecommendation {
    return suggestBudgetAllocation(
      availableBudget,
      this.historicalTransactions,
      currentAllocations,
      this.monthlyIncome,
      activeGoals
    );
  }

  /**
   * Suggest allocation for new pod
   */
  suggestNewPodAllocation(
    podName: string,
    availableBudget: number,
    existingPods: Array<{ name: string; allocated: number }>
  ): BudgetAllocation | null {
    return suggestNewPodAllocation(
      podName,
      availableBudget,
      this.historicalTransactions,
      existingPods
    );
  }

  /**
   * Predict goal achievement
   */
  predictGoal(
    goal: {
      name: string;
      targetAmount: number;
      currentAmount: number;
      monthlyContribution: number;
      deadline: string;
    },
    activeGoals: Array<{ monthlyContribution: number }>
  ): GoalPrediction {
    return predictGoalAchievement(
      goal,
      this.historicalTransactions,
      this.monthlyIncome,
      activeGoals
    );
  }

  /**
   * Detect anomalies in transaction
   */
  detectAnomaly(transaction: TrainingTransaction): AnomalyResult {
    return detectAnomaly(transaction, this.historicalTransactions);
  }

  /**
   * Get AI insights for dashboard
   */
  getDashboardInsights() {
    // Analyze overall financial health
    const totalSpending = this.historicalTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalIncome = this.historicalTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const savingsRate = totalIncome > 0 ? (totalIncome - totalSpending) / totalIncome : 0;
    
    return {
      savingsRate: Math.round(savingsRate * 100),
      totalSpending,
      totalIncome,
      transactionCount: this.historicalTransactions.length,
      topCategories: this.getTopCategories(),
    };
  }

  private getTopCategories(): Array<{ category: string; amount: number; percentage: number }> {
    const categoryTotals: Record<string, number> = {};
    let total = 0;
    
    this.historicalTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        total += tx.amount;
      });
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }
}

// Export singleton instance
export const aiService = new AIService();

