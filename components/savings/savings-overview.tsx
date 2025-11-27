"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, mockSavingsAccount } from "@/lib/mock-data"
import { PiggyBank, TrendingUp, Calendar, Target, ArrowUpRight, ArrowDownLeft } from "lucide-react"

export function SavingsOverview() {
  const savingsAccount = mockSavingsAccount
  const monthlyInterest = (savingsAccount.balance * savingsAccount.interestRate) / 100 / 12
  const projectedYearlyEarnings = (savingsAccount.balance * savingsAccount.interestRate) / 100

  // Mock savings goals
  const savingsGoals = [
    { name: "Emergency Fund", target: 50000, current: 25000, priority: "high" },
    { name: "Textbooks Next Semester", target: 30000, current: 18000, priority: "medium" },
    { name: "Laptop Upgrade", target: 800000, current: 25000, priority: "low" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(savingsAccount.balance)}</div>
            <p className="text-xs text-muted-foreground">+{savingsAccount.interestRate}% annual interest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(savingsAccount.totalInterestEarned)}</div>
            <p className="text-xs text-muted-foreground">Total earned to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Interest</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyInterest)}</div>
            <p className="text-xs text-muted-foreground">Estimated monthly earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Projection</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedYearlyEarnings)}</div>
            <p className="text-xs text-muted-foreground">If balance maintained</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track your progress towards financial goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savingsGoals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100
              const remaining = goal.target - goal.current

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% complete</span>
                    <span>{formatCurrency(remaining)} remaining</span>
                  </div>
                </div>
              )
            })}
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Target className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your savings account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Deposit to Savings</div>
                    <div className="text-sm text-muted-foreground">Transfer from main balance</div>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Withdraw Savings</div>
                    <div className="text-sm text-muted-foreground">For emergencies only</div>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Auto-Save Setup</div>
                    <div className="text-sm text-muted-foreground">Save unspent daily funds</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
