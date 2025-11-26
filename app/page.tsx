"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BalanceOverview } from "@/components/dashboard/balance-overview"
import { PriorityManager } from "@/components/budget/priority-manager"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MainNav } from "@/components/navigation/main-nav"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("seba-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("seba-user")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem("seba-user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("seba-user")
  }

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = (updatedUser: any) => {
    setUser(updatedUser)
    localStorage.setItem("seba-user", JSON.stringify(updatedUser))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading SEBA...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <DashboardHeader user={user} onLogout={handleLogout} onEditProfile={handleEditProfile} />
      
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
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
              
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Dashboard</span>
                  </div>
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                    {getGreeting()},<br />
                    <span className="text-4xl">{user.firstName || user.lastName}!</span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                    Here's your financial overview for today
                  </p>
                </div>
              </div>
            </div>

            <BalanceOverview user={user} />

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative">
                    <PriorityManager />
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative">
                    <QuickActions />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <MainNav />
      </div>

      <EditProfileDialog
        user={user}
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
