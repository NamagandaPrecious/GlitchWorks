"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/mock-data"
import { ArrowUpRight, ArrowDownLeft, Percent } from "lucide-react"

// Mock savings transactions
const savingsTransactions = [
  {
    id: "1",
    type: "deposit",
    amount: 5000,
    description: "Unspent daily budget auto-save",
    date: "2024-09-19T18:00:00Z",
    interestEarned: 0,
  },
  {
    id: "2",
    type: "interest",
    amount: 73,
    description: "Monthly interest payment",
    date: "2024-09-01T00:00:00Z",
    interestEarned: 73,
  },
  {
    id: "3",
    type: "deposit",
    amount: 3500,
    description: "Manual savings deposit",
    date: "2024-08-28T14:30:00Z",
    interestEarned: 0,
  },
  {
    id: "4",
    type: "withdrawal",
    amount: 8000,
    description: "Emergency textbook purchase",
    date: "2024-08-25T10:15:00Z",
    interestEarned: 0,
  },
  {
    id: "5",
    type: "deposit",
    amount: 2000,
    description: "Unspent daily budget auto-save",
    date: "2024-08-24T18:00:00Z",
    interestEarned: 0,
  },
]

export function SavingsTransactions() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-5 w-5 text-success" />
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-warning" />
      case "interest":
        return <Percent className="h-5 w-5 text-chart-4" />
      default:
        return <ArrowDownLeft className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-success"
      case "withdrawal":
        return "text-warning"
      case "interest":
        return "text-chart-4"
      default:
        return "text-foreground"
    }
  }

  const getAmountPrefix = (type: string) => {
    return type === "withdrawal" ? "-" : "+"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Activity</CardTitle>
        <CardDescription>Recent deposits, withdrawals, and interest payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savingsTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}
                  {formatCurrency(transaction.amount)}
                </p>
                {transaction.interestEarned > 0 && <p className="text-xs text-muted-foreground">Interest earned</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
