"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, mockTransactions, mockPriorities, mockBudget } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react"

export function SpendingOverview() {
  // Calculate spending by category for the current month
  const currentMonth = new Date().getMonth()
  const monthlyTransactions = mockTransactions.filter(
    (t) => new Date(t.date).getMonth() === currentMonth && t.status === "completed",
  )

  const spendingByCategory = monthlyTransactions.reduce(
    (acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)
  const monthlyBudget = mockBudget.dailyLimit * 30 // Approximate monthly budget

  // Calculate trends (mock data for demonstration)
  const trends = {
    Meals: { change: -5.2, isPositive: true },
    "Learning Materials": { change: 12.3, isPositive: false },
    Transport: { change: -2.1, isPositive: true },
    "Health & Wellness": { change: 8.7, isPositive: false },
