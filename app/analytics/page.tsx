"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SpendingOverview } from "@/components/analytics/spending-overview"
import { SpendingChart } from "@/components/analytics/spending-chart"
import { FinancialInsights } from "@/components/analytics/financial-insights"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/navigation/main-nav"

export default function AnalyticsPage() {
  const handleLogout = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <DashboardHeader onLogout={handleLogout} />
      
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
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Financial Analytics</span>
                  </div>
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent leading-tight">
                    Smart Insights
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                    Understand your spending patterns and improve your financial health
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-2">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Overview</TabsTrigger>
                    <TabsTrigger value="charts" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Charts</TabsTrigger>
                    <TabsTrigger value="insights" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-800/80">Insights</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative">
                    <SpendingOverview />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="charts" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative">
                    <SpendingChart />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative">
                    <FinancialInsights />
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
