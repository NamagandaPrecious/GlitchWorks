"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/mock-data"
import { Calculator, PieChart, TrendingUp, Info } from "lucide-react"

export function BudgetCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(150000)
  const [essentialsPercent, setEssentialsPercent] = useState([60])
  const [wantsPercent, setWantsPercent] = useState([25])
  const [savingsPercent, setSavingsPercent] = useState([15])

  const essentials = (monthlyIncome * essentialsPercent[0]) / 100
  const wants = (monthlyIncome * wantsPercent[0]) / 100
  const savings = (monthlyIncome * savingsPercent[0]) / 100
  const total = essentialsPercent[0] + wantsPercent[0] + savingsPercent[0]

  const dailyBudget = monthlyIncome / 30
  const dailyEssentials = essentials / 30
  const dailySavings = savings / 30

  // Adjust percentages to ensure they add up to 100%
  const handleEssentialsChange = (value: number[]) => {
    const newEssentials = value[0]
    const remaining = 100 - newEssentials
    const wantsRatio = wantsPercent[0] / (wantsPercent[0] + savingsPercent[0])

    setEssentialsPercent(value)
    setWantsPercent([Math.round(remaining * wantsRatio)])
    setSavingsPercent([Math.round(remaining * (1 - wantsRatio))])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Student Budget Calculator
          </CardTitle>
          <CardDescription>Plan your monthly budget using the student-adapted 50/30/20 rule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income/Allowance (UGX)</Label>
            <Input
              id="income"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="150000"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Essentials (Meals, Transport, Materials): {essentialsPercent[0]}%</Label>
              <Slider
                value={essentialsPercent}
                onValueChange={handleEssentialsChange}
                max={80}
                min={40}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                {formatCurrency(essentials)} per month • {formatCurrency(dailyEssentials)} per day
              </div>
            </div>

            <div className="space-y-3">
              <Label>Wants (Entertainment, Social): {wantsPercent[0]}%</Label>
              <Slider
                value={wantsPercent}
                onValueChange={setWantsPercent}
                max={40}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">{formatCurrency(wants)} per month</div>
            </div>

            <div className="space-y-3">
              <Label>Savings & Emergency Fund: {savingsPercent[0]}%</Label>
              <Slider
                value={savingsPercent}
                onValueChange={setSavingsPercent}
                max={30}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                {formatCurrency(savings)} per month • {formatCurrency(dailySavings)} per day
              </div>
            </div>
          </div>

          {total !== 100 && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>Your percentages add up to {total}%. They should total 100%.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">Essentials</span>
                </div>
                <span className="font-semibold">{formatCurrency(essentials)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm">Wants</span>
                </div>
                <span className="font-semibold">{formatCurrency(wants)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                  <span className="text-sm">Savings</span>
                </div>
                <span className="font-semibold">{formatCurrency(savings)}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Total Monthly Budget</span>
                <span>{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                <span>Daily Budget</span>
                <span>{formatCurrency(dailyBudget)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Savings Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Monthly Savings</span>
                <span className="font-semibold">{formatCurrency(savings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Semester Savings (4 months)</span>
                <span className="font-semibold">{formatCurrency(savings * 4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Yearly Savings</span>
                <span className="font-semibold">{formatCurrency(savings * 12)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span className="text-sm">With 3.5% Interest (1 year)</span>
                <span className="font-semibold">{formatCurrency(savings * 12 * 1.035)}</span>
              </div>
            </div>
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                By saving {formatCurrency(dailySavings)} daily, you'll build a strong financial foundation!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready to start budgeting?</h3>
              <p className="text-sm text-muted-foreground">Use these calculations to set up your SEBA budget</p>
            </div>
            <Button size="lg">Create Budget Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
