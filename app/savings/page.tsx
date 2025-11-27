"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SavingsOverview } from "@/components/savings/savings-overview"
import { SavingsTransactions } from "@/components/savings/savings-transactions"
import { AutoSaveSettings } from "@/components/savings/auto-save-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  mockUser, 
  mockSavingsAccount, 
  mockSavingsGoals, 
  mockSavingsTransactions,
  formatCurrency 
} from "@/lib/mock-data"
import { 
  PiggyBank, 
  TrendingUp, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings
} from "lucide-react"

export default function SavingsPage() {
  const [user] = useState(mockUser)
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    window.location.href = "/"
  }

  const savingsAccount = mockSavingsAccount
  const monthlyInterest = (savingsAccount.balance * savingsAccount.interestRate) / 100 / 12
  const projectedYearlyEarnings = (savingsAccount.balance * savingsAccount.interestRate) / 100
  
  const totalSavingsGoals = mockSavingsGoals.reduce((sum, goal) => sum + goal.target, 0)
  const totalSavedTowardsGoals = mockSavingsGoals.reduce((sum, goal) => sum + goal.current, 0)
  const overallProgress = (totalSavedTowardsGoals / totalSavingsGoals) * 100

  const recentTransactions = mockSavingsTransactions.slice(0, 3)
  const autoSaveTransactions = mockSavingsTransactions.filter(t => t.type === "auto-save")
  const interestEarned = mockSavingsTransactions.filter(t => t.type === "interest")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
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
            {/* Hero Section */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Savings & Interest</span>
                  </div>
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent leading-tight">
                    Grow Your Money
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                    Build wealth with smart saving habits and compound interest
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <Badge variant="outline" className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
                      <TrendingUp className="h-3 w-3" />
                      {savingsAccount.interestRate}% APY
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Savings</CardTitle>
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                      <PiggyBank className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(savingsAccount.balance)}</div>
                    <p className="text-xs text-muted-foreground">+{savingsAccount.interestRate}% annual interest</p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Interest Earned</CardTitle>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(savingsAccount.totalInterestEarned)}</div>
                    <p className="text-xs text-muted-foreground">Total earned to date</p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Monthly Interest</CardTitle>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(monthlyInterest)}</div>
                    <p className="text-xs text-muted-foreground">Estimated monthly earnings</p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Goals Progress</CardTitle>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                      <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overallProgress.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(totalSavedTowardsGoals)} / {formatCurrency(totalSavingsGoals)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Savings Goals Overview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
              <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Savings Goals Progress</span>
                    <Button variant="outline" size="sm" className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-700/80">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </CardTitle>
                  <CardDescription>Track your progress towards financial goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSavingsGoals.map((goal) => {
                      const progress = (goal.current / goal.target) * 100
                      const remaining = goal.target - goal.current
                      const daysToTarget = goal.targetDate ? 
                        Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

                      return (
                        <div key={goal.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{goal.icon}</span>
                              <div>
                                <h3 className="font-medium">{goal.name}</h3>
                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {progress.toFixed(0)}% complete
                              </div>
                            </div>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(remaining)} remaining</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "default" : "secondary"}>
                                {goal.priority} priority
                              </Badge>
                              {daysToTarget && (
                                <span>{daysToTarget} days left</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start h-auto p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <ArrowDownLeft className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Deposit to Savings</div>
                          <div className="text-xs text-green-100">Transfer from main balance</div>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-auto p-3 bg-transparent border-white/20 hover:bg-white/20 dark:hover:bg-slate-700/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Withdraw Savings</div>
                          <div className="text-xs text-muted-foreground">For emergencies only</div>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Auto-Save Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">This Week</span>
                        <span className="font-medium">{formatCurrency(autoSaveTransactions.reduce((sum, t) => sum + t.amount, 0))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transactions</span>
                        <span className="font-medium">{autoSaveTransactions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Interest Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">This Month</span>
                        <span className="font-medium">{formatCurrency(monthlyInterest)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">This Year</span>
                        <span className="font-medium">{formatCurrency(projectedYearlyEarnings)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rate</span>
                        <span className="font-medium">{savingsAccount.interestRate}% APY</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-2">
                  <TabsList className="grid w-full grid-cols-4 bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Overview</TabsTrigger>
                    <TabsTrigger value="goals" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Goals</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Activity</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Settings</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="overview">
                <SavingsOverview />
              </TabsContent>

              <TabsContent value="goals" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                  <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle>All Savings Goals</CardTitle>
                      <CardDescription>Manage and track your financial objectives</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockSavingsGoals.map((goal) => {
                          const progress = (goal.current / goal.target) * 100
                          const remaining = goal.target - goal.current
                          
                          return (
                            <div key={goal.id} className="p-4 border border-white/20 rounded-lg bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{goal.icon}</span>
                                  <div>
                                    <h3 className="font-semibold">{goal.name}</h3>
                                    <p className="text-sm text-muted-foreground">{goal.category}</p>
                                  </div>
                                </div>
                                <Badge variant={goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "default" : "secondary"}>
                                  {goal.priority} priority
                                </Badge>
                              </div>
                              <Progress value={progress} className="h-3" />
                              <div className="flex justify-between text-sm">
                                <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                                <span>{progress.toFixed(0)}% complete</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatCurrency(remaining)} remaining</span>
                                {goal.targetDate && (
                                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <SavingsTransactions />
              </TabsContent>

              <TabsContent value="settings">
                <AutoSaveSettings />
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
