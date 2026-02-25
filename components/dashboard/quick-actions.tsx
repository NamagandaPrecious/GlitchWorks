"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, PiggyBank, BarChart3, BookOpen, ArrowRight } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Make Payment",
      description: "Pay authorized vendors",
      icon: CreditCard,
      href: "/payments",
      color: "bg-success/10 text-success",
    },
    {
      title: "View Savings",
      description: "Check your savings growth",
      icon: PiggyBank,
      href: "/savings",
      color: "bg-chart-4/10 text-chart-4",
    },
    {
      title: "Analytics",
      description: "Review spending patterns",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Learn",
      description: "Financial education resources",
      icon: BookOpen,
      href: "/learn",
      color: "bg-chart-2/10 text-chart-2",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Button variant="ghost" className="h-auto p-4 justify-start w-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
