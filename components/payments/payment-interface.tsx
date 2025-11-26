"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  formatCurrency,
  mockVendors,
  mockPriorities,
  mockBudget,
  getTodaySpending,
  mockTransactions,
  mockUser,
  mockSavingsAccount,
} from "@/lib/mock-data"
import { CreditCard, Shield, AlertTriangle, CheckCircle, Clock, Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react"

interface PaymentInterfaceProps {
  user?: any
}

export function PaymentInterface({ user = mockUser }: PaymentInterfaceProps) {
  const [transactionType, setTransactionType] = useState<"payment" | "deposit" | "withdraw">("payment")
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle")

  const todaySpending = getTodaySpending(mockTransactions)
  const remainingDaily = mockBudget.dailyLimit - todaySpending
  const selectedPriority = mockPriorities.find((p) => p.name === selectedCategory)
  const categorySpent = mockTransactions
    .filter((t) => {
      const today = new Date().toISOString().split("T")[0]
      return t.date.startsWith(today) && t.status === "completed" && t.category === selectedCategory
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryRemaining = selectedPriority ? selectedPriority.dailyAllocation - categorySpent : 0
  const userBalance = user?.balance || mockUser.balance
  const savingsBalance = mockSavingsAccount.balance
  const paymentAmount = Number(amount)

  const canPay = () => {
    if (!paymentAmount) return false
    
    if (transactionType === "payment") {
      if (!selectedVendor || !selectedCategory) return false
    if (paymentAmount > userBalance) return false
    if (paymentAmount > remainingDaily) return false
    if (selectedPriority && paymentAmount > categoryRemaining) return false
    } else if (transactionType === "deposit") {
      if (paymentAmount > userBalance) return false
    } else if (transactionType === "withdraw") {
      if (paymentAmount > savingsBalance) return false
    }
    
    return true
  }

  const getValidationErrors = () => {
    const errors = []
    
    if (transactionType === "payment") {
    if (paymentAmount > userBalance) {
      errors.push({
        type: "balance",
        message: `Insufficient balance. You have ${formatCurrency(userBalance)} available.`,
      })
    }
    if (paymentAmount > remainingDaily) {
      errors.push({
        type: "daily",
        message: `This payment exceeds your daily limit. You have ${formatCurrency(remainingDaily)} remaining today.`,
      })
    }
    if (paymentAmount > categoryRemaining && selectedPriority) {
      errors.push({
        type: "category",
        message: `This payment exceeds your ${selectedCategory} budget for today.`,
      })
    }
    } else if (transactionType === "deposit") {
      if (paymentAmount > userBalance) {
        errors.push({
          type: "balance",
          message: `Insufficient balance. You have ${formatCurrency(userBalance)} available for deposit.`,
        })
      }
    } else if (transactionType === "withdraw") {
      if (paymentAmount > savingsBalance) {
        errors.push({
          type: "savings",
          message: `Insufficient savings balance. You have ${formatCurrency(savingsBalance)} available for withdrawal.`,
        })
      }
    }
    
    return errors
  }

  const handlePayment = async () => {
    if (!canPay()) return

    setIsProcessing(true)

    setTimeout(() => {
      const shouldFail = Math.random() < 0.1

      if (shouldFail) {
        setPaymentStatus("failed")
      } else {
        setPaymentStatus("success")
        if (user && typeof user.balance === "number") {
          user.balance -= paymentAmount
        }
      }
      setIsProcessing(false)

      setTimeout(() => {
        setSelectedVendor("")
        setSelectedCategory("")
        setAmount("")
        setDescription("")
        setPaymentStatus("idle")
      }, 3000)
    }, 2000)
  }

  if (paymentStatus === "success") {
    const getSuccessMessage = () => {
      switch (transactionType) {
        case "deposit":
          return {
            title: "Deposit Successful!",
            message: `Your deposit of ${formatCurrency(paymentAmount)} has been added to your savings account.`,
            icon: <ArrowDownLeft className="h-16 w-16 text-success mx-auto mb-4" />
          }
        case "withdraw":
          return {
            title: "Withdrawal Successful!",
            message: `Your withdrawal of ${formatCurrency(paymentAmount)} has been processed from your savings.`,
            icon: <ArrowUpRight className="h-16 w-16 text-warning mx-auto mb-4" />
          }
        default:
          return {
            title: "Payment Successful!",
            message: `Your payment of ${formatCurrency(paymentAmount)} has been processed.`,
            icon: <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          }
      }
    }

    const successInfo = getSuccessMessage()

    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          {successInfo.icon}
          <h3 className="text-xl font-semibold mb-2">{successInfo.title}</h3>
          <p className="text-muted-foreground mb-4">{successInfo.message}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono">TXN{Date.now()}</span>
            </div>
            {transactionType === "deposit" && (
              <>
                <div className="flex justify-between">
                  <span>New savings balance:</span>
                  <span className="font-medium">{formatCurrency(savingsBalance + paymentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining balance:</span>
                  <span className="font-medium">{formatCurrency(userBalance - paymentAmount)}</span>
                </div>
              </>
            )}
            {transactionType === "withdraw" && (
              <>
                <div className="flex justify-between">
                  <span>New savings balance:</span>
                  <span className="font-medium">{formatCurrency(savingsBalance - paymentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New main balance:</span>
                  <span className="font-medium">{formatCurrency(userBalance + paymentAmount)}</span>
                </div>
              </>
            )}
            {transactionType === "payment" && (
              <>
            <div className="flex justify-between">
              <span>Remaining balance:</span>
                  <span className="font-medium">{formatCurrency(userBalance - paymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining today:</span>
              <span className="font-medium">{formatCurrency(remainingDaily - paymentAmount)}</span>
            </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
          <p className="text-muted-foreground mb-4">
            Your payment of {formatCurrency(paymentAmount)} could not be processed.
          </p>
          <p className="text-sm text-muted-foreground">Please check your balance and try again.</p>
        </CardContent>
      </Card>
    )
  }

  const validationErrors = getValidationErrors()

  return (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-3xl font-bold text-balance bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-3">
                {transactionType === "deposit" ? "Deposit to Savings" :
                 transactionType === "withdraw" ? "Withdraw from Savings" :
                 "Make a Payment"}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                {transactionType === "deposit" ? "Transfer money from your main balance to savings" :
                 transactionType === "withdraw" ? "Withdraw money from your savings account" :
                 "Pay authorized vendors within your budget limits"}
              </p>
            </div>
      </div>

          {/* Transaction Type Selector */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-950/50 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="space-y-6">
                <div className="text-center">
                  <Label className="text-lg font-semibold text-slate-700 dark:text-slate-300">Transaction Type</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose your transaction type</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={transactionType === "payment" ? "default" : "outline"}
                    onClick={() => setTransactionType("payment")}
                    className={`h-auto p-6 rounded-2xl transition-all duration-300 ${
                      transactionType === "payment" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105" 
                        : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        transactionType === "payment" 
                          ? "bg-white/20" 
                          : "bg-blue-100 dark:bg-blue-900/50"
                      }`}>
                        <CreditCard className={`h-6 w-6 ${
                          transactionType === "payment" 
                            ? "text-white" 
                            : "text-blue-600 dark:text-blue-400"
                        }`} />
                      </div>
                      <span className="text-sm font-semibold">Payment</span>
                    </div>
                  </Button>
                  <Button
                    variant={transactionType === "deposit" ? "default" : "outline"}
                    onClick={() => setTransactionType("deposit")}
                    className={`h-auto p-6 rounded-2xl transition-all duration-300 ${
                      transactionType === "deposit" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl scale-105" 
                        : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        transactionType === "deposit" 
                          ? "bg-white/20" 
                          : "bg-green-100 dark:bg-green-900/50"
                      }`}>
                        <ArrowDownLeft className={`h-6 w-6 ${
                          transactionType === "deposit" 
                            ? "text-white" 
                            : "text-green-600 dark:text-green-400"
                        }`} />
                      </div>
                      <span className="text-sm font-semibold">Deposit</span>
                    </div>
                  </Button>
                  <Button
                    variant={transactionType === "withdraw" ? "default" : "outline"}
                    onClick={() => setTransactionType("withdraw")}
                    className={`h-auto p-6 rounded-2xl transition-all duration-300 ${
                      transactionType === "withdraw" 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl scale-105" 
                        : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        transactionType === "withdraw" 
                          ? "bg-white/20" 
                          : "bg-orange-100 dark:bg-orange-900/50"
                      }`}>
                        <ArrowUpRight className={`h-6 w-6 ${
                          transactionType === "withdraw" 
                            ? "text-white" 
                            : "text-orange-600 dark:text-orange-400"
                        }`} />
                      </div>
                      <span className="text-sm font-semibold">Withdraw</span>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                    <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Available Balance</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
            <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                      <PiggyBank className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Savings Balance</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(savingsBalance)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {transactionType === "payment" && (
                <div className="mt-6 pt-6 border-t border-green-200/50 dark:border-green-800/50">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Daily Limit Remaining</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(remainingDaily)}</p>
            </div>
          </div>
              )}
        </CardContent>
      </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900/50 dark:to-indigo-950/50 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                  {transactionType === "deposit" ? <ArrowDownLeft className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> :
                   transactionType === "withdraw" ? <ArrowUpRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> :
                   <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {transactionType === "deposit" ? "Deposit Details" :
                   transactionType === "withdraw" ? "Withdrawal Details" :
                   "Payment Details"}
                </span>
          </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
                {transactionType === "deposit" ? "Enter deposit amount and details" :
                 transactionType === "withdraw" ? "Enter withdrawal amount and details" :
                 "Select vendor and enter payment information"}
              </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactionType === "payment" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vendor">Authorized Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {mockVendors
                    .filter((v) => v.isAuthorized)
                    .map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex items-center gap-2">
                          <span>{vendor.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {vendor.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Spending Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockPriorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.name}>
                      <div className="flex items-center gap-2">
                        <span>{priority.icon}</span>
                        <span>{priority.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={transactionType === "withdraw" ? savingsBalance : userBalance}
              step="1000"
              min="0"
            />
            {paymentAmount > 0 && (
              <div className="text-xs space-y-1">
                {transactionType === "deposit" && (
                  <>
                    {paymentAmount <= userBalance ? (
                      <div className="text-success">✓ Amount within available balance</div>
                    ) : (
                      <div className="text-destructive font-medium">
                        ✗ Insufficient balance! You need {formatCurrency(paymentAmount - userBalance)} more
                      </div>
                    )}
                    {paymentAmount <= userBalance && (
                      <div className="text-muted-foreground">
                        Balance after deposit: {formatCurrency(userBalance - paymentAmount)}
                      </div>
                    )}
                  </>
                )}
                {transactionType === "withdraw" && (
                  <>
                    {paymentAmount <= savingsBalance ? (
                      <div className="text-success">✓ Amount within available savings</div>
                    ) : (
                      <div className="text-destructive font-medium">
                        ✗ Insufficient savings! You need {formatCurrency(paymentAmount - savingsBalance)} more
                      </div>
                    )}
                    {paymentAmount <= savingsBalance && (
                      <div className="text-muted-foreground">
                        Savings after withdrawal: {formatCurrency(savingsBalance - paymentAmount)}
                      </div>
                    )}
                  </>
                )}
                {transactionType === "payment" && (
                  <>
                {paymentAmount <= userBalance ? (
                  <div className="text-success">✓ Amount within available balance</div>
                ) : (
                  <div className="text-destructive font-medium">
                    ✗ Insufficient balance! You need {formatCurrency(paymentAmount - userBalance)} more
                  </div>
                )}
                {paymentAmount <= userBalance && (
                  <div className="text-muted-foreground">
                    Balance after payment: {formatCurrency(userBalance - paymentAmount)}
                  </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this payment for?"
            />
          </div>

          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}

          {transactionType === "payment" && selectedCategory && validationErrors.length === 0 && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Category budget: {formatCurrency(categoryRemaining)} remaining of{" "}
                {formatCurrency(selectedPriority?.dailyAllocation || 0)} allocated today
              </AlertDescription>
            </Alert>
          )}
          
          {transactionType === "deposit" && validationErrors.length === 0 && paymentAmount > 0 && (
            <Alert>
              <ArrowDownLeft className="h-4 w-4" />
              <AlertDescription>
                This deposit will earn {mockSavingsAccount.interestRate}% annual interest in your savings account.
              </AlertDescription>
            </Alert>
          )}
          
          {transactionType === "withdraw" && validationErrors.length === 0 && paymentAmount > 0 && (
            <Alert>
              <ArrowUpRight className="h-4 w-4" />
              <AlertDescription>
                Withdrawing from savings will reduce your interest earnings. Consider if this is necessary.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200/50 dark:border-blue-800/50 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {transactionType === "deposit" ? "Deposit Summary" :
                     transactionType === "withdraw" ? "Withdrawal Summary" :
                     "Payment Summary"}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {paymentAmount ? formatCurrency(paymentAmount) : "Enter amount"}
                    {transactionType === "deposit" ? " to savings account" :
                     transactionType === "withdraw" ? " from savings account" :
                     ` to ${selectedVendor ? mockVendors.find((v) => v.id === selectedVendor)?.name : "selected vendor"}`}
                  </p>
                  {paymentAmount > 0 && (
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      {transactionType === "deposit" && paymentAmount <= userBalance && (
                        <>Balance after deposit: {formatCurrency(userBalance - paymentAmount)}</>
                      )}
                      {transactionType === "withdraw" && paymentAmount <= savingsBalance && (
                        <>Savings after withdrawal: {formatCurrency(savingsBalance - paymentAmount)}</>
                      )}
                      {transactionType === "payment" && paymentAmount <= userBalance && (
                        <>Balance after payment: {formatCurrency(userBalance - paymentAmount)}</>
                      )}
                </p>
              )}
            </div>
                <Button 
                  onClick={handlePayment} 
                  disabled={!canPay() || isProcessing} 
                  size="lg"
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
              {isProcessing ? (
                <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                    transactionType === "deposit" ? "Deposit to Savings" :
                    transactionType === "withdraw" ? "Withdraw from Savings" :
                "Authorize Payment"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
