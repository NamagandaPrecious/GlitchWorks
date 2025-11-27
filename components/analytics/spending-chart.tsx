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
