"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { formatCurrency } from "@/lib/mock-data"
import { Plus, Minus, Calculator } from "lucide-react"

interface Priority {
  id: string
  name: string
  tier: 1 | 2 | 3
  dailyAllocation: number
  color: string
  icon: string
}

const defaultPriorities: Priority[] = [
  {
    id: "1",
    name: "Meals",
    tier: 1,
    dailyAllocation: 8000,
    color: "bg-success",
    icon: "🍽️",
  },
  {
    id: "2",
    name: "Learning Materials",
    tier: 2,
    dailyAllocation: 3000,
    color: "bg-chart-4",
    icon: "📚",
  },
  {
    id: "3",
    name: "Transport",
    tier: 2,
    dailyAllocation: 2000,
    color: "bg-warning",
    icon: "🚌",
  },
]

interface BudgetSetupProps {
  onComplete: (budget: any) => void
}

export function BudgetSetup({ onComplete }: BudgetSetupProps) {
  const [totalAmount, setTotalAmount] = useState(100000)
  const [priorities, setPriorities] = useState<Priority[]>(defaultPriorities)
  const [customPriority, setCustomPriority] = useState("")

  const dailyTotal = priorities.reduce((sum, p) => sum + p.dailyAllocation, 0)
  const projectedDays = Math.floor(totalAmount / dailyTotal)

  const updatePriorityAllocation = (id: string, amount: number) => {
    setPriorities((prev) => prev.map((p) => (p.id === id ? { ...p, dailyAllocation: Math.max(0, amount) } : p)))
  }

  const addCustomPriority = () => {
    if (!customPriority.trim()) return

    const newPriority: Priority = {
      id: Date.now().toString(),
      name: customPriority,
      tier: 3,
      dailyAllocation: 1000,
      color: "bg-chart-5",
      icon: "💡",
    }

    setPriorities((prev) => [...prev, newPriority])
    setCustomPriority("")
  }

  const removePriority = (id: string) => {
    setPriorities((prev) => prev.filter((p) => p.id !== id))
  }

  const handleComplete = () => {
    const budget = {
      id: Date.now().toString(),
      userId: "1",
      totalAmount,
      dailyLimit: dailyTotal,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + projectedDays * 24 * 60 * 60 * 1000).toISOString(),
      priorities,
      status: "active" as const,
    }
    onComplete(budget)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-balance">Set Up Your Budget</h2>
        <p className="text-muted-foreground text-balance">Configure your spending priorities and daily limits</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Budget Amount</CardTitle>
            <CardDescription>How much money do you want to budget?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX)</Label>
              <Input
                id="amount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                placeholder="100000"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Budget Projection</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Daily spending limit:</span>
                  <span className="font-medium">{formatCurrency(dailyTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected duration:</span>
                  <span className="font-medium">{projectedDays} days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Priorities</CardTitle>
            <CardDescription>Set daily allocations for each category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorities.map((priority) => (
              <div key={priority.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{priority.icon}</span>
                    <span className="font-medium">{priority.name}</span>
                    <Badge variant={priority.tier === 1 ? "default" : priority.tier === 2 ? "secondary" : "outline"}>
                      Tier {priority.tier}
                    </Badge>
                  </div>
                  {priorities.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removePriority(priority.id)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily allocation</span>
                    <span className="font-medium">{formatCurrency(priority.dailyAllocation)}</span>
                  </div>
                  <Slider
                    value={[priority.dailyAllocation]}
                    onValueChange={([value]) => updatePriorityAllocation(priority.id, value)}
                    max={20000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add custom priority..."
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomPriority()}
              />
              <Button onClick={addCustomPriority} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Budget Summary</h3>
              <p className="text-sm text-muted-foreground">
                Your budget will last approximately {projectedDays} days with a daily limit of{" "}
                {formatCurrency(dailyTotal)}
              </p>
            </div>
            <Button onClick={handleComplete} size="lg">
              Create Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
