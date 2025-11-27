"use client"

import { addDays, format } from "date-fns"
import type { Budget, Priority, Transaction } from "@/lib/mock-data"

export interface SpendingPrediction {
  date: string
  amount: number
}

export interface SpendingAnomaly {
  date: string
  amount: number
  message: string
}

export interface OptimizationSuggestion {
  from: string
  to: string
  amount: number
  reason: string
}

export interface GamificationStats {
  streak: number
  points: number
  badges: string[]
  nextMilestone: string
}

const getDailyTotals = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    const date = transaction.date.split("T")[0]
    acc[date] = (acc[date] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)
}

export const generateLstmLikeForecast = (transactions: Transaction[], days = 7): SpendingPrediction[] => {
  const dailyTotals = getDailyTotals(transactions)
  const dates = Object.keys(dailyTotals)
  const last7Days = dates.slice(-7)
  const avgDaily =
    last7Days.reduce((sum, date) => sum + dailyTotals[date], 0) / Math.max(last7Days.length, 1) || 0

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(new Date(), index + 1)
    const seasonalVariance = Math.sin(index) * 0.05
    const noise = (Math.random() - 0.5) * 0.1
    const predictedAmount = Math.max(0, avgDaily * (1 + seasonalVariance + noise))

    return {
      date: format(date, "MMM d"),
      amount: Math.round(predictedAmount),
    }
  })
}

export const detectSpendingAnomalies = (transactions: Transaction[], dailyLimit: number): SpendingAnomaly[] => {
  const anomalies: SpendingAnomaly[] = []
  const dailyTotals = getDailyTotals(transactions)

  Object.entries(dailyTotals).forEach(([date, amount]) => {
    if (amount > dailyLimit * 1.2) {
      anomalies.push({
        date: format(new Date(date), "MMM d"),
        amount,
        message: "Spending exceeded the daily limit by 20%",
      })
    }
  })

  transactions.forEach((transaction) => {
    if (transaction.amount > dailyLimit * 0.8) {
      anomalies.push({
        date: format(new Date(transaction.date), "MMM d"),
        amount: transaction.amount,
        message: `Large single transaction detected for ${transaction.category}`,
      })
    }
  })

  return anomalies.slice(0, 5)
}

const getCategorySpend = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)
}

const getPriorityAllocation = (priority: Priority, days = 30) => priority.dailyAllocation * days

export const calculateBudgetOptimization = (
  budget: Budget,
  transactions: Transaction[],
  days = 30,
): OptimizationSuggestion[] => {
  const categorySpend = getCategorySpend(transactions)
  const overAllocated: { priority: Priority; deficit: number }[] = []
  const underAllocated: { priority: Priority; surplus: number }[] = []

  budget.priorities.forEach((priority) => {
    const allocated = getPriorityAllocation(priority, days)
    const spent = categorySpend[priority.name] || 0

    if (spent > allocated * 1.1) {
      overAllocated.push({ priority, deficit: spent - allocated })
    } else if (spent < allocated * 0.8) {
      underAllocated.push({ priority, surplus: allocated - spent })
    }
  })

  const suggestions: OptimizationSuggestion[] = []

  overAllocated.forEach((overPriority) => {
    let remainingDeficit = overPriority.deficit

    for (const underPriority of underAllocated) {
      if (remainingDeficit <= 0) break
      if (underPriority.surplus <= 0) continue

      const amountToMove = Math.min(remainingDeficit, underPriority.surplus)
      remainingDeficit -= amountToMove
      underPriority.surplus -= amountToMove

      suggestions.push({
        from: underPriority.priority.name,
        to: overPriority.priority.name,
        amount: Math.round(amountToMove),
        reason: `${overPriority.priority.name} is trending ${Math.round(
          (overPriority.deficit / getPriorityAllocation(overPriority.priority, days)) * 100,
        )}% above plan.`,
      })
    }
  })

  return suggestions.slice(0, 3)
}

export const calculateGamificationStats = (transactions: Transaction[], dailyLimit: number): GamificationStats => {
  const dailyTotals = getDailyTotals(transactions)
  const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  let currentStreak = 0
  let maxStreak = 0

  sortedDates.forEach((date) => {
    if (dailyTotals[date] <= dailyLimit) {
      currentStreak += 1
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })

  const totalSaved = Object.values(dailyTotals)
    .filter((amount) => amount < dailyLimit)
    .reduce((sum, amount) => sum + (dailyLimit - amount), 0)

  const points = Math.round(totalSaved / 100) + maxStreak * 10
  const badges: string[] = []

  if (maxStreak >= 3) badges.push("Consistency Starter")
  if (maxStreak >= 7) badges.push("Weekly Warrior")
  if (totalSaved >= dailyLimit * 5) badges.push("Savings Sprinter")

  const nextMilestone =
    maxStreak >= 7 ? "Maintain streak to reach 14-day milestone" : "Keep spending under budget for 3 more days"

  return {
    streak: maxStreak,
    points,
    badges,
    nextMilestone,
  }
}



