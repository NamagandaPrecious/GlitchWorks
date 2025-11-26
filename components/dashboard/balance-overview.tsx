"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, mockBudget, mockTransactions, getTodaySpending, calculateDaysRemaining } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Calendar, Wallet } from "lucide-react"

interface BalanceOverviewProps {
  user: any
}

export function BalanceOverview({ user }: BalanceOverviewProps) {
  const todaySpending = getTodaySpending(mockTransactions)
  const remainingToday = mockBudget.dailyLimit - todaySpending
  const spendingProgress = (todaySpending / mockBudget.dailyLimit) * 100
  const daysRemaining = calculateDaysRemaining(mockBudget)

  const userBalance = user?.balance ?? 125000
  const userSavings = user?.totalSavings ?? 45000

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Current Balance</CardTitle>
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
            <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{formatCurrency(userBalance)}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {userBalance > 50000 ? "Excellent balance" : userBalance > 10000 ? "Good balance" : "Low balance"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Today's Spending</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatCurrency(todaySpending)}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400">of {formatCurrency(mockBudget.dailyLimit)} limit</span>
              <span className="text-blue-600 dark:text-blue-400">{spendingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(spendingProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Total Savings</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{formatCurrency(userSavings)}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">+3.5% interest rate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-orange-200/50 dark:border-orange-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-2xl"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Budget Period</CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{daysRemaining}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">days remaining</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
