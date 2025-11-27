"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Budget, Transaction } from "@/lib/mock-data"
import {
  calculateBudgetOptimization,
  calculateGamificationStats,
  detectSpendingAnomalies,
  generateLstmLikeForecast,
  type GamificationStats,
  type OptimizationSuggestion,
  type SpendingAnomaly,
  type SpendingPrediction,
} from "@/lib/prediction-engine"
import { mockBudget, mockTransactions } from "@/lib/mock-data"

interface InsightsState {
  predictions: SpendingPrediction[]
  anomalies: SpendingAnomaly[]
  suggestions: OptimizationSuggestion[]
  gamification: GamificationStats
  lastUpdated: string | null
  refreshInsights: (transactions?: Transaction[], budget?: Budget) => void
}

const defaultGamification: GamificationStats = {
  streak: 0,
  points: 0,
  badges: [],
  nextMilestone: "Make your first under-budget day to start a streak",
}

export const useInsightsStore = create<InsightsState>()(
  persist(
    (set) => ({
      predictions: [],
      anomalies: [],
      suggestions: [],
      gamification: defaultGamification,
      lastUpdated: null,
      refreshInsights: (transactions = mockTransactions, budget = mockBudget) => {
        const predictions = generateLstmLikeForecast(transactions)
        const anomalies = detectSpendingAnomalies(transactions, budget.dailyLimit)
        const suggestions = calculateBudgetOptimization(budget, transactions)
        const gamification = calculateGamificationStats(transactions, budget.dailyLimit)

        set({
          predictions,
          anomalies,
          suggestions,
          gamification,
          lastUpdated: new Date().toISOString(),
        })
      },
    }),
    {
      name: "uniguard-insights-store",
      version: 1,
    },
  ),
)



