"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/mock-data"
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from "lucide-react"

interface FinancialInsightsProps {
  user?: any
}

// Mock insights data
const insights = [
  {
    id: "1",
    type: "positive",
    title: "Great Savings Habit!",
    description: "You've saved 18% of your budget this month, which is above the recommended 15%.",
    action: "Consider setting a higher savings goal to maximize your interest earnings.",
    icon: CheckCircle,
    color: "text-success",
  },
  {
    id: "2",
    type: "warning",
    title: "Learning Materials Overspend",
    description: "You've spent 23% more on learning materials than allocated this month.",
    action: "Review your textbook purchases and consider digital alternatives or library resources.",
    icon: AlertTriangle,
    color: "text-warning",
  },
  {
    id: "3",
    type: "tip",
    title: "Meal Budget Optimization",
    description: "You consistently spend less on meals. You could reallocate UGX 2,000 daily to other priorities.",
    action: "Adjust your budget priorities to better match your actual spending patterns.",
    icon: Lightbulb,
    color: "text-chart-4",
  },
  {
    id: "4",
    type: "goal",
    title: "Emergency Fund Progress",
    description: "You're 50% towards your emergency fund goal. Keep up the momentum!",
    action: "Maintain your current savings rate to reach your goal by December.",
    icon: Target,
    color: "text-success",
  },
]

const spendingTips = [
  {
    category: "Meals",
    tip: "Cook more meals at home to save an average of UGX 3,000 per day",
    potential: 90000,
  },
  {
    category: "Transport",
    tip: "Use campus shuttle services instead of private transport",
    potential: 15000,
  },
  {
    category: "Learning Materials",
    tip: "Share textbooks with classmates or use library copies",
    potential: 25000,
  },
]

export function FinancialInsights({ user }: FinancialInsightsProps) {
  const userName = user?.firstName || user?.name?.split(" ")?.[0] || "Student"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personal Insights for {userName}
          </CardTitle>
          <CardDescription>AI-powered recommendations based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = insight.icon
              return (
                <Alert key={insight.id}>
                  <Icon className={`h-4 w-4 ${insight.color}`} />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.type === "positive"
                            ? "default"
                            : insight.type === "warning"
                              ? "destructive"
                              : insight.type === "tip"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <AlertDescription>{insight.description}</AlertDescription>
                    <p className="text-sm font-medium text-foreground">💡 {insight.action}</p>
                  </div>
                </Alert>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Money-Saving Tips</CardTitle>
          <CardDescription>Personalized suggestions to optimize your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spendingTips.map((tip, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{tip.category}</h4>
                  <p className="text-sm text-muted-foreground">{tip.tip}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-success">{formatCurrency(tip.potential)}</div>
                  <div className="text-xs text-muted-foreground">potential monthly savings</div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">Get More Personalized Tips</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              This Month's Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Days under budget</span>
              <Badge className="bg-success text-success-foreground">15/19 days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Money saved</span>
              <Badge className="bg-success text-success-foreground">{formatCurrency(27000)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest earned</span>
              <Badge className="bg-success text-success-foreground">{formatCurrency(875)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Impulse purchases</span>
              <Badge variant="destructive">4 this month</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Budget exceeded</span>
              <Badge variant="destructive">4/19 days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unplanned spending</span>
              <Badge variant="destructive">{formatCurrency(8500)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
