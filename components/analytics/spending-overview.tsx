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
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>of {formatCurrency(monthlyBudget)} budget</span>
                <span>{((totalSpent / monthlyBudget) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(totalSpent / monthlyBudget) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent / 19)}</div>
            <p className="text-xs text-muted-foreground">
              {totalSpent / 19 < mockBudget.dailyLimit ? "Under" : "Over"} daily limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Meals</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(spendingByCategory["Meals"] || 0)} spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">18%</div>
            <p className="text-xs text-muted-foreground">Of budget saved this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Your spending breakdown for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPriorities.map((priority) => {
              const spent = spendingByCategory[priority.name] || 0
              const monthlyAllocation = priority.dailyAllocation * 30
              const progress = (spent / monthlyAllocation) * 100
              const trend = trends[priority.name as keyof typeof trends]

              return (
                <div key={priority.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{priority.icon}</span>
                      <span className="font-medium">{priority.name}</span>
                      {trend && (
                        <Badge variant={trend.isPositive ? "default" : "secondary"}>
                          {trend.isPositive ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(trend.change)}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(spent)}</div>
                      <div className="text-xs text-muted-foreground">of {formatCurrency(monthlyAllocation)}</div>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% of monthly allocation</span>
                    <span>
                      {spent < monthlyAllocation
                        ? `${formatCurrency(monthlyAllocation - spent)} remaining`
                        : `${formatCurrency(spent - monthlyAllocation)} over budget`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
