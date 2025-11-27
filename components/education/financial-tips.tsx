"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/mock-data"
import { BookOpen, Clock, Star, TrendingUp, PiggyBank, Shield, Calculator } from "lucide-react"

// Mock educational content
const financialTips = [
  {
    id: "1",
    title: "The 50/30/20 Rule for Students",
    category: "Budgeting",
    difficulty: "Beginner",
    readTime: "3 min",
    description: "Learn how to allocate your student budget: 50% for essentials, 30% for wants, and 20% for savings.",
    content: "As a student, managing limited funds is crucial. The 50/30/20 rule can be adapted for student life...",
    icon: Calculator,
    color: "bg-chart-4",
  },
  {
    id: "2",
    title: "Building Your Emergency Fund",
    category: "Savings",
    difficulty: "Beginner",
    readTime: "4 min",
    description: "Why every student needs an emergency fund and how to build one on a tight budget.",
    content: "Unexpected expenses can derail your academic journey. Here's how to prepare...",
    icon: Shield,
    color: "bg-success",
  },
  {
    id: "3",
    title: "Understanding Compound Interest",
    category: "Investing",
    difficulty: "Intermediate",
    readTime: "5 min",
    description: "How small savings can grow significantly over time through compound interest.",
    content: "Einstein called compound interest the eighth wonder of the world. Here's why...",
    icon: TrendingUp,
    color: "bg-warning",
  },
  {
    id: "4",
    title: "Smart Student Spending Habits",
    category: "Budgeting",
    difficulty: "Beginner",
    readTime: "6 min",
    description: "Practical tips for making your student budget stretch further without sacrificing quality of life.",
    content: "Being a student doesn't mean you can't live well. These strategies will help...",
    icon: PiggyBank,
    color: "bg-chart-2",
  },
]

const challenges = [
  {
    id: "1",
    title: "7-Day Spending Tracker",
    description: "Track every expense for a week to understand your spending patterns",
    reward: 500,
    progress: 85,
    daysLeft: 2,
  },
  {
    id: "2",
    title: "Save UGX 5,000 This Month",
    description: "Build your emergency fund by saving a small amount daily",
    reward: 1000,
    progress: 60,
    daysLeft: 12,
  },
  {
    id: "3",
    title: "Cook 5 Meals at Home",
    description: "Save money by preparing meals instead of buying from vendors",
    reward: 750,
    progress: 40,
    daysLeft: 8,
  },
]

export function FinancialTips() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-success text-success-foreground"
      case "Intermediate":
        return "bg-warning text-warning-foreground"
      case "Advanced":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Progress
            </CardTitle>
            <CardDescription>Your financial literacy journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budgeting Basics</span>
                <span className="font-medium">3/4 completed</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Savings Strategies</span>
                <span className="font-medium">2/3 completed</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Investment Fundamentals</span>
                <span className="font-medium">0/5 completed</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Continue Learning
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Financial Challenges
            </CardTitle>
            <CardDescription>Earn rewards while building good habits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.slice(0, 2).map((challenge) => (
              <div key={challenge.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">+{formatCurrency(challenge.reward)}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{challenge.progress}% complete</span>
                    <span>{challenge.daysLeft} days left</span>
                  </div>
                  <Progress value={challenge.progress} className="h-1" />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Challenges
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Education Library</CardTitle>
          <CardDescription>Build your financial knowledge with these curated resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {financialTips.map((tip) => {
              const Icon = tip.icon
              return (
                <Card key={tip.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${tip.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{tip.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tip.category}</Badge>
                            <Badge className={getDifficultyColor(tip.difficulty)}>{tip.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {tip.readTime}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
