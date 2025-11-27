"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, mockTransactions, mockVendors } from "@/lib/mock-data"
import { Download, Search, Filter, Receipt, Calendar, X } from "lucide-react"
import { useState } from "react"
import { DateRangePicker } from "@/components/ui/date-picker"
import { isWithinInterval, parseISO } from "date-fns"

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus

    let matchesDateRange = true
    if (dateRange.from && dateRange.to) {
      const transactionDate = parseISO(transaction.date)
      matchesDateRange = isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to,
      })
    } else if (dateRange.from) {
      const transactionDate = parseISO(transaction.date)
      matchesDateRange = transactionDate >= dateRange.from
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange
  })

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined })
  }

  const getVendorName = (vendorId: string) => {
    return mockVendors.find((v) => v.id === vendorId)?.name || "Unknown Vendor"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      case "failed":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-muted-foreground">View and manage your payment history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Filter by date range"
                className="w-[280px]"
              />
              {(dateRange.from || dateRange.to) && (
                <Button variant="ghost" size="icon" onClick={clearDateFilter} className="h-10 w-10">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Meals">Meals</SelectItem>
                <SelectItem value="Learning Materials">Learning Materials</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(dateRange.from || dateRange.to || filterCategory !== "all" || filterStatus !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {dateRange.from && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Date range
                  <X className="h-3 w-3 cursor-pointer" onClick={clearDateFilter} />
                </Badge>
              )}
              {filterCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filterCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCategory("all")} />
                </Badge>
              )}
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filterStatus}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus("all")} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{transaction.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getVendorName(transaction.vendorId)} • {formatDate(transaction.date)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatCurrency(transaction.amount)}</p>
                  {transaction.receiptUrl && (
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No transactions found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
