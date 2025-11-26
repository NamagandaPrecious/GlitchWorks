"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, mockPriorities, mockTransactions, getTodaySpending } from "@/lib/mock-data"
import { Edit, TrendingUp, TrendingDown } from "lucide-react"

export function PriorityManager() {
  const todaySpending = getTodaySpending(mockTransactions)

  // Calculate spending by category for today
  const spendingByCategory = mockTransactions
    .filter((t) => {
      const today = new Date().toISOString().split("T")[0]
      return t.date.startsWith(today) && t.status === "completed"
    })
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spending Priorities</h2>
          <p className="text-muted-foreground">Manage your daily spending allocations</p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Priorities
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockPriorities.map((priority) => {
          const spent = spendingByCategory[priority.name] || 0
          const remaining = priority.dailyAllocation - spent
          const progress = (spent / priority.dailyAllocation) * 100

          return (
            <Card key={priority.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{priority.icon}</span>
                    <CardTitle className="text-lg">{priority.name}</CardTitle>
                  </div>
                  <Badge variant={priority.tier === 1 ? "default" : priority.tier === 2 ? "secondary" : "outline"}>
                    Tier {priority.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today's spending</span>
                    <span className="font-medium">{formatCurrency(spent)}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>of {formatCurrency(priority.dailyAllocation)} allocated</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    {remaining >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success">{formatCurrency(remaining)} remaining</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">{formatCurrency(Math.abs(remaining))} over budget</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
