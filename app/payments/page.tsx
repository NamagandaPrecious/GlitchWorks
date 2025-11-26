"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PaymentInterface } from "@/components/payments/payment-interface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionHistory } from "@/components/transactions/transaction-history"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  mockUser, 
  mockTransactions, 
  mockVendors, 
  mockBudget,
  formatCurrency,
  getTodaySpending,
  getWeeklySpending,
  getMonthlySpending,
  getSpendingByCategory
} from "@/lib/mock-data"
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock,
  DollarSign,
  Receipt,
  AlertTriangle
} from "lucide-react"

export default function PaymentsPage() {
  const [user] = useState(mockUser)
  const [activeTab, setActiveTab] = useState("pay")

  const handleLogout = () => {
    window.location.href = "/"
  }

  const todaySpending = getTodaySpending(mockTransactions)
  const weeklySpending = getWeeklySpending(mockTransactions)
  const monthlySpending = getMonthlySpending(mockTransactions)
  const spendingByCategory = getSpendingByCategory(mockTransactions, 7)
  
  const recentTransactions = mockTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const pendingTransactions = mockTransactions.filter(t => t.status === "pending")
  const failedTransactions = mockTransactions.filter(t => t.status === "failed")

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
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Secure Payments</span>
                  </div>
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
                    Smart Payments
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                    Make secure payments to authorized vendors with real-time tracking
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <Badge variant="outline" className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
                      <Shield className="h-3 w-3" />
                      Secure Payments
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Today's Spending</CardTitle>
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(todaySpending)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(mockBudget.dailyLimit - todaySpending)} remaining
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Weekly Total</CardTitle>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Monthly Total</CardTitle>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(monthlySpending)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(monthlySpending / 30)} daily average
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-sm"></div>
                <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Authorized Vendors</CardTitle>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                      <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{mockVendors.filter(v => v.isAuthorized).length}</div>
                    <p className="text-xs text-muted-foreground">
                      Available for payments
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Alerts */}
            {(pendingTransactions.length > 0 || failedTransactions.length > 0) && (
              <div className="space-y-4">
                {pendingTransactions.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-yellow-200/50 dark:border-yellow-800/50 shadow-xl">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {pendingTransactions.length} transaction(s) pending approval
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {failedTransactions.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-red-200/50 dark:border-red-800/50 shadow-xl">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            {failedTransactions.length} transaction(s) failed - review required
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-2">
                  <TabsList className="grid w-full grid-cols-3 max-w-lg bg-transparent">
                    <TabsTrigger value="pay" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Make Payment</TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Transaction History</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Spending Analytics</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="pay">
                <PaymentInterface user={user} />
              </TabsContent>

              <TabsContent value="history">
                <TransactionHistory />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                  <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle>Spending by Category (Last 7 Days)</CardTitle>
                      <CardDescription>Breakdown of your payment patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(spendingByCategory).map(([category, amount]) => {
                          const percentage = (amount / weeklySpending) * 100
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{category}</span>
                                <div className="text-right">
                                  <div className="font-medium">{formatCurrency(amount)}</div>
                                  <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-2 border border-white/20 rounded bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                              <div>
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                                <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                    <Card className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 border border-white/20 rounded bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span className="text-sm">SEBA Wallet</span>
                            </div>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 border border-white/20 rounded bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span className="text-sm">Mobile Money</span>
                            </div>
                            <Badge variant="outline">Available</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
