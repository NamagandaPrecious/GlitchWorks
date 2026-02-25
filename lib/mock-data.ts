// Mock data for UniGuard Wallet system
export interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  university: string
  phone: string
  balance: number
  totalSavings: number
  joinedDate: string
}

export interface Budget {
  id: string
  userId: string
  totalAmount: number
  dailyLimit: number
  startDate: string
  endDate: string
  priorities: Priority[]
  status: "active" | "completed" | "paused"
}

export interface Priority {
  id: string
  name: string
  tier: 1 | 2 | 3
  dailyAllocation: number
  color: string
  icon: string
}

export interface Transaction {
  id: string
  userId: string
  vendorId: string
  amount: number
  description: string
  category: string
  date: string
  status: "completed" | "pending" | "failed"
  receiptUrl?: string
}

export interface Vendor {
  id: string
  name: string
  category: string
  location: string
  isAuthorized: boolean
  logo?: string
}

export interface SavingsAccount {
  id: string
  userId: string
  balance: number
  interestRate: number
  lastInterestDate: string
  totalInterestEarned: number
}

// Mock data
export const mockUser: User = {
  id: "1",
  name: "Mukamajoseph67",
  firstName: "Mukamajoseph67",
  lastName: "",
  email: "mukamajoseph67@student.ucu.ac.ug",
  university: "Uganda Christian University",
  phone: "+256 700 123 456",
  balance: 125000,
  totalSavings: 45000,
  joinedDate: "2024-08-15",
}

export const mockPriorities: Priority[] = [
  {
    id: "1",
    name: "Meals",
    tier: 1,
    dailyAllocation: 8000,
    color: "bg-success",
    icon: "🍽️",
  },
  {
    id: "2",
    name: "Learning Materials",
    tier: 2,
    dailyAllocation: 3000,
    color: "bg-chart-4",
    icon: "📚",
  },
  {
    id: "3",
    name: "Transport",
    tier: 2,
    dailyAllocation: 2000,
    color: "bg-warning",
    icon: "🚌",
  },
  {
    id: "4",
    name: "Health & Wellness",
    tier: 3,
    dailyAllocation: 1500,
    color: "bg-chart-2",
    icon: "💊",
  },
]

export const mockBudget: Budget = {
  id: "1",
  userId: "1",
  totalAmount: 100000,
  dailyLimit: 14500,
  startDate: "2024-09-01",
  endDate: "2024-09-30",
  priorities: mockPriorities,
  status: "active",
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "1",
    vendorId: "1",
    amount: 6000,
    description: "Lunch at Main Cafeteria",
    category: "Meals",
    date: new Date().toISOString(),
    status: "completed",
  },
  {
    id: "2",
    userId: "1",
    vendorId: "2",
    amount: 15000,
    description: "Programming Textbook",
    category: "Learning Materials",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "3",
    userId: "1",
    vendorId: "3",
    amount: 2000,
    description: "Campus to Town Transport",
    category: "Transport",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "4",
    userId: "1",
    vendorId: "1",
    amount: 4500,
    description: "Breakfast at Main Cafeteria",
    category: "Meals",
    date: new Date().toISOString(),
    status: "completed",
  },
  {
    id: "5",
    userId: "1",
    vendorId: "4",
    amount: 8000,
    description: "Prescription Medicine",
    category: "Health & Wellness",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "6",
    userId: "1",
    vendorId: "2",
    amount: 12000,
    description: "Mathematics Workbook",
    category: "Learning Materials",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
]

export const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "UCU Main Cafeteria",
    category: "Food & Dining",
    location: "Main Campus",
    isAuthorized: true,
  },
  {
    id: "2",
    name: "Campus Bookstore",
    category: "Learning Materials",
    location: "Academic Block",
    isAuthorized: true,
  },
  {
    id: "3",
    name: "Campus Transport Service",
    category: "Transport",
    location: "Main Gate",
    isAuthorized: true,
  },
  {
    id: "4",
    name: "Health Center Pharmacy",
    category: "Health & Wellness",
    location: "Health Center",
    isAuthorized: true,
  },
]

export const mockSavingsAccount: SavingsAccount = {
  id: "1",
  userId: "1",
  balance: 45000,
  interestRate: 3.5,
  lastInterestDate: "2024-09-01",
  totalInterestEarned: 1575,
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  priority: "high" | "medium" | "low"
  targetDate?: string
  category: string
  icon: string
}

export interface SavingsTransaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "interest" | "auto-save"
  amount: number
  description: string
  date: string
  status: "completed" | "pending" | "failed"
}

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    target: 100000,
    current: 45000,
    priority: "high",
    targetDate: "2024-12-31",
    category: "Emergency",
    icon: "🚨"
  },
  {
    id: "2",
    name: "Textbooks Next Semester",
    target: 50000,
    current: 30000,
    priority: "medium",
    targetDate: "2025-01-15",
    category: "Education",
    icon: "📚"
  },
  {
    id: "3",
    name: "Laptop Upgrade",
    target: 800000,
    current: 15000,
    priority: "low",
    targetDate: "2025-06-30",
    category: "Technology",
    icon: "💻"
  },
  {
    id: "4",
    name: "Graduation Trip",
    target: 200000,
    current: 5000,
    priority: "medium",
    targetDate: "2025-12-31",
    category: "Travel",
    icon: "✈️"
  }
]

export const mockSavingsTransactions: SavingsTransaction[] = [
  {
    id: "1",
    userId: "1",
    type: "auto-save",
    amount: 5000,
    description: "Auto-save from unspent daily budget",
    date: new Date().toISOString(),
    status: "completed"
  },
  {
    id: "2",
    userId: "1",
    type: "interest",
    amount: 131,
    description: "Monthly interest earned",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "completed"
  },
  {
    id: "3",
    userId: "1",
    type: "deposit",
    amount: 10000,
    description: "Manual deposit from main balance",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed"
  },
  {
    id: "4",
    userId: "1",
    type: "auto-save",
    amount: 3000,
    description: "Auto-save from unspent daily budget",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed"
  },
  {
    id: "5",
    userId: "1",
    type: "interest",
    amount: 131,
    description: "Monthly interest earned",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed"
  }
]

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount)
}

export const calculateDaysRemaining = (budget: Budget): number => {
  const today = new Date()
  const endDate = new Date(budget.endDate)
  const diffTime = endDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getTodaySpending = (transactions: Transaction[]): number => {
  const today = new Date().toISOString().split("T")[0]
  return transactions
    .filter((t) => t.date.startsWith(today) && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getWeeklySpending = (transactions: Transaction[]): number => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  return transactions
    .filter((t) => t.date >= weekAgo && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getMonthlySpending = (transactions: Transaction[]): number => {
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  return transactions
    .filter((t) => t.date >= monthAgo && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getSpendingByCategory = (transactions: Transaction[], days: number = 7): Record<string, number> => {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  return transactions
    .filter((t) => t.date >= cutoffDate && t.status === "completed")
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)
}

export const getBudgetProgress = (budget: Budget, transactions: Transaction[]): {
  totalSpent: number
  remainingAmount: number
  daysRemaining: number
  dailyAverage: number
  projectedEndDate: string
} => {
  const totalSpent = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const remainingAmount = budget.totalAmount - totalSpent
  const daysRemaining = Math.ceil(remainingAmount / budget.dailyLimit)
  const dailyAverage = totalSpent / Math.max(1, Math.ceil((Date.now() - new Date(budget.startDate).getTime()) / (1000 * 60 * 60 * 24)))
  const projectedEndDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString()
  
  return {
    totalSpent,
    remainingAmount,
    daysRemaining,
    dailyAverage,
    projectedEndDate
  }
}
