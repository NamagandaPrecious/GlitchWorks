"use client"

import { Bell, Settings, User, LogOut, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"

interface DashboardHeaderProps {
  user: any
  onLogout: () => void
  onEditProfile: () => void
}

export function DashboardHeader({ user, onLogout, onEditProfile }: DashboardHeaderProps) {
  const firstName = user?.firstName || ""
  const lastName = user?.lastName || ""
  const email = user?.email || ""
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}` || "U"

  const handleLogout = () => {
    console.log("[v0] Logout clicked")
    onLogout()
  }

  const handleEditProfile = () => {
    console.log("[v0] Edit profile clicked")
    onEditProfile()
  }

  return (
    <header className="border-b border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src="/seba-logo.jpg"
                  alt="SEBA Logo"
                  width={52}
                  height={52}
                  className="relative rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SEBA
                  </span>
                  <div className="flex space-x-1">
                    <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                    <Sparkles className="h-3 w-3 text-purple-500 animate-pulse delay-100" />
                    <Sparkles className="h-3 w-3 text-pink-500 animate-pulse delay-200" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-400 dark:to-slate-300 bg-clip-text text-transparent">
                  Student Essentials Budgeting Assistant
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center">
                <ThemeToggle />
              </div>
            </div>

            <div className="relative">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 shadow-lg">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={handleEditProfile}
            >
              <Avatar className="h-10 w-10 ring-2 ring-gradient-to-r from-blue-500 to-purple-500 hover:ring-gradient-to-r hover:from-blue-400 hover:to-purple-400 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-10 px-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border-red-200 dark:border-red-800 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
