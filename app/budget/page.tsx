"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetSetup } from "@/components/budget/budget-setup"
import { PriorityManager } from "@/components/budget/priority-manager"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  mockUser, 
  mockBudget, 
  mockTransactions, 
  mockPriorities,
  formatCurrency,
  getBudgetProgress,
  getSpendingByCategory,
  getTodaySpending,
  getWeeklySpending,
  getMonthlySpending
} from "@/lib/mock-data"
import { 
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"

export default function BudgetPage() {
  const [user] = useState(mockUser)
  const [hasBudget, setHasBudget] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    window.location.href = "/"
  }

  const handleBudgetComplete = (budget: any) => {
    console.log("Budget created:", budget)
    setHasBudget(true)
  }

  const budgetProgress = getBudgetProgress(mockBudget, mockTransactions)
  const spendingByCategory = getSpendingByCategory(mockTransactions, 7)
  const todaySpending = getTodaySpending(mockTransactions)
  const weeklySpending = getWeeklySpending(mockTransactions)
  const monthlySpending = getMonthlySpending(mockTransactions)

  const budgetHealthScore = Math.max(0, Math.min(100, 
    ((budgetProgress.remainingAmount / mockBudget.totalAmount) * 100) - 
    ((budgetProgress.dailyAverage / mockBudget.dailyLimit) * 20)
  ))

  if (!hasBudget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <DashboardHeader user={user} onLogout={handleLogout} onEditProfile={() => {}} />
        
        <div className="flex relative z-10">
          <aside className="hidden md:block w-72 border-r bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <div className="p-6">
              <div className="mb-8">
                <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4"></div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h2>
              </div>
              <MainNav />
            </div>
          </aside>
          
          <main className="flex-1 container mx-auto px-6 py-10 pb-24 md:pb-10">
            <div className="space-y-10">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
                
                <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Budget Setup</span>
                    </div>
                    <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                      Create Your Budget
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                      Set up your monthly budget and spending priorities
                    </p>
                  </div>
                </div>
              </div>

              <BudgetSetup onComplete={handleBudgetComplete} />
            </div>
          </main>
        </div>
        
        <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
          <MainNav />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <DashboardHeader user={user} onLogout={handleLogout} onEditProfile={() => {}} />
      
      <div className="flex relative z-10">
        <aside className="hidden md:block w-72 border-r bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <div className="p-6">
            <div className="mb-8">
              <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4"></div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h2>
            </div>
            <MainNav />
          </div>
        </aside>
        
        <main className="flex-1 container mx-auto px-6 py-10 pb-24 md:pb-10">
          <div className="space-y-10">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Budget Management</span>
                  </div>
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                    Smart Budgeting
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                    Monitor and control your spending with intelligent insights
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setHasBudget(false)}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-700/80"
                    >
                      Edit Budget
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-2">
                  <TabsList className="grid w-full grid-cols-4 bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Overview</TabsTrigger>
                    <TabsTrigger value="priorities" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Priorities</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Analytics</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Settings</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                  <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Budget Health Score
                      </CardTitle>
                      <CardDescription>Overall budget performance indicator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {budgetHealthScore.toFixed(0)}/100
                          </span>
                          <Badge variant={budgetHealthScore >= 70 ? "default" : budgetHealthScore >= 40 ? "secondary" : "destructive"}>
                            {budgetHealthScore >= 70 ? "Excellent" : budgetHealthScore >= 40 ? "Good" : "Needs Attention"}
                          </Badge>
                        </div>
                        <Progress value={budgetHealthScore} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(mockBudget.totalAmount)}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(budgetProgress.remainingAmount)} remaining
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{budgetProgress.daysRemaining}</div>
                        <p className="text-xs text-muted-foreground">
                          Projected end: {new Date(budgetProgress.projectedEndDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(Math.round(budgetProgress.dailyAverage))}</div>
                        <p className="text-xs text-muted-foreground">
                          Limit: {formatCurrency(mockBudget.dailyLimit)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                          {budgetProgress.remainingAmount > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {budgetProgress.remainingAmount > 0 ? "Active" : "Exhausted"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {budgetProgress.totalSpent > mockBudget.totalAmount ? "Over budget" : "On track"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Today's Spending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(todaySpending)}</div>
                        <p className="text-xs text-muted-foreground">
                          {todaySpending > mockBudget.dailyLimit ? (
                            <span className="text-red-500 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Over daily limit
                            </span>
                          ) : (
                            <span className="text-green-500 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Within limit
                            </span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Weekly Spending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(weeklySpending)}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(weeklySpending / 7)} daily average
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(monthlySpending)}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(monthlySpending / 30)} daily average
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="priorities">
                <PriorityManager />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                  <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle>Spending by Category (Last 7 Days)</CardTitle>
                      <CardDescription>Breakdown of your spending patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(spendingByCategory).map(([category, amount]) => {
                          const priority = mockPriorities.find(p => p.name === category)
                          const percentage = (amount / weeklySpending) * 100
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{priority?.icon || "📊"}</span>
                                  <span className="font-medium">{category}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{formatCurrency(amount)}</div>
                                  <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                  <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle>Budget Settings</CardTitle>
                      <CardDescription>Manage your budget configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                        <div>
                          <h3 className="font-medium">Current Budget</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(mockBudget.totalAmount)} • {mockBudget.priorities.length} priorities
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setHasBudget(false)}
                          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-700/80"
                        >
                          Edit Budget
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                        <div>
                          <h3 className="font-medium">Budget Period</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(mockBudget.startDate).toLocaleDateString()} - {new Date(mockBudget.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={mockBudget.status === "active" ? "default" : "secondary"}>
                          {mockBudget.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <MainNav />
      </div>
    </div>
  )
}