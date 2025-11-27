"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/mock-data"

// Mock data for charts
const dailySpendingData = [
  { date: "Sep 1", amount: 12000, budget: 14500 },
  { date: "Sep 2", amount: 8500, budget: 14500 },
  { date: "Sep 3", amount: 15200, budget: 14500 },
  { date: "Sep 4", amount: 11800, budget: 14500 },
  { date: "Sep 5", amount: 9200, budget: 14500 },
  { date: "Sep 6", amount: 13400, budget: 14500 },
  { date: "Sep 7", amount: 10600, budget: 14500 },
]

const categoryData = [
  { name: "Meals", value: 45000, color: "#22c55e" },
  { name: "Learning Materials", value: 18000, color: "#3b82f6" },
  { name: "Transport", value: 12000, color: "#f59e0b" },
  { name: "Health & Wellness", value: 8000, color: "#8b5cf6" },
]

const weeklyTrendData = [
  { week: "Week 1", spending: 85000, savings: 15000 },
  { week: "Week 2", spending: 78000, savings: 22000 },
  { week: "Week 3", spending: 82000, savings: 18000 },
  { week: "Week 4", spending: 75000, savings: 25000 },
]

export function SpendingChart() {
  const [chartType, setChartType] = useState("daily")

  const renderChart = () => {
    switch (chartType) {
      case "daily":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" fill="#22c55e" name="Spent" />
              <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "category":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        )

      case "trend":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="spending" stroke="#ef4444" name="Spending" strokeWidth={2} />
              <Line type="monotone" dataKey="savings" stroke="#22c55e" name="Savings" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const getChartDescription = () => {
    switch (chartType) {
      case "daily":
        return "Your daily spending compared to budget limits"
      case "category":
        return "Breakdown of spending by category this month"
      case "trend":
        return "Weekly spending and savings trends"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Spending Analytics</CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </div>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Spending</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="trend">Weekly Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
