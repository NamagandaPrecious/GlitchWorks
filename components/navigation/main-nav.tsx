"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CreditCard, PiggyBank, BarChart3, BookOpen, Store, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Budget", href: "/budget", icon: Settings },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Savings", href: "/savings", icon: PiggyBank },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Learn", href: "/learn", icon: BookOpen },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/20 md:relative md:border-t-0 md:bg-transparent z-40 shadow-2xl md:shadow-none">
      <div className="flex justify-around md:flex-col md:space-y-3 md:justify-start p-3">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center gap-2 md:gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-lg hover:scale-105",
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm"></div>
              )}
              <div className="relative z-10 flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white/20 shadow-lg" 
                    : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white/80 dark:group-hover:bg-slate-700/80"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive 
                      ? "text-white" 
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                  )} />
                </div>
                <span className="hidden md:inline font-medium">{item.name}</span>
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
