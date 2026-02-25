# UniGuard Wallet - Technical Architecture Documentation

## 🏛️ System Architecture Overview

### Technology Stack Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Framework: Next.js 14.2 (App Router)                          │
│  ├── React 18 (UI Library)                                     │
│  ├── TypeScript 5.0 (Type Safety)                             │
│  └── Server Components + Client Components                     │
│                                                                 │
│  Styling: Tailwind CSS 4.1                                     │
│  ├── Utility-first CSS                                          │
│  ├── Dark mode support                                         │
│  └── Responsive design system                                  │
│                                                                 │
│  UI Components: shadcn/ui + Radix UI                            │
│  ├── Accessible components                                      │
│  ├── Customizable themes                                       │
│  └── Form components                                           │
│                                                                 │
│  State Management:                                             │
│  ├── React Hooks (Local state)                                 │
│  ├── Zustand (Global state)                                    │
│  └── localStorage (Persistence)                                │
│                                                                 │
│  Data Visualization: Recharts                                  │
│  ├── Line charts (Predictions)                                 │
│  ├── Bar charts (Spending)                                     │
│  └── Pie charts (Categories)                                   │
│                                                                 │
│  Forms: React Hook Form + Zod                                  │
│  ├── Validation                                                │
│  ├── Type-safe forms                                           │
│  └── Error handling                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Prediction Engine (lib/prediction-engine.ts)                  │
│  ├── LSTM-inspired algorithm                                   │
│  ├── Time series analysis                                      │
│  ├── Pattern recognition                                        │
│  └── Forecast generation                                        │
│                                                                 │
│  Anomaly Detection (lib/prediction-engine.ts)                   │
│  ├── Statistical analysis                                       │
│  ├── Pattern matching                                           │
│  ├── Risk scoring                                               │
│  └── Alert generation                                           │
│                                                                 │
│  Budget Optimization (lib/prediction-engine.ts)                │
│  ├── Efficiency analysis                                        │
│  ├── Reallocation suggestions                                   │
│  ├── Impact projection                                          │
│  └── Ranking algorithm                                          │
│                                                                 │
│  Gamification Engine (hooks/use-insights-store.ts)             │
│  ├── Point calculation                                          │
│  ├── Streak tracking                                            │
│  ├── Badge detection                                            │
│  └── Level progression                                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser Storage:                                               │
│  ├── localStorage                                               │
│  │   ├── User data                                              │
│  │   ├── Transactions                                           │
│  │   ├── Budgets                                                │
│  │   └── Savings goals                                          │
│  │                                                              │
│  └── Zustand Persist                                            │
│      ├── ML Insights                                            │
│      ├── Predictions                                            │
│      ├── Anomaly alerts                                         │
│      └── Gamification state                                     │
│                                                                 │
│  Future: Backend Integration                                    │
│  ├── REST API                                                   │
│  ├── Database (PostgreSQL/MongoDB)                             │
│  └── File storage (Receipts)                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### Request-Response Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  UI Component    │
│  (React)         │
└────────┬─────────┘
         │
         │ 1. User Interaction
         ▼
┌─────────────────┐
│  Event Handler   │
│  (onClick, etc.) │
└────────┬─────────┘
         │
         │ 2. State Update
         ▼
┌─────────────────┐
│  State Manager   │
│  (Zustand/Hooks)│
└────────┬─────────┘
         │
         │ 3. Business Logic
         ▼
┌─────────────────┐
│  ML Engine /     │
│  Calculator     │
└────────┬─────────┘
         │
         │ 4. Data Processing
         ▼
┌─────────────────┐
│  Data Storage    │
│  (localStorage)  │
└────────┬─────────┘
         │
         │ 5. State Update
         ▼
┌─────────────────┐
│  Component       │
│  Re-render       │
└─────────────────┘
```

### ML Processing Flow

```
Transaction Data
    │
    ▼
┌─────────────────────────────────┐
│  Data Aggregation               │
│  • Collect last 30-90 days      │
│  • Group by category            │
│  • Create time series           │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Feature Engineering            │
│  • Normalize amounts            │
│  • Encode categories            │
│  • Extract patterns             │
└─────────────┬───────────────────┘
              │
              ├──────────────────┐
              │                  │
              ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│  LSTM Model      │  │  Anomaly Model   │
│  (Predictions)   │  │  (Detection)     │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Forecasts       │  │  Alerts         │
│  (7-30 days)     │  │  (Risk scores)  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  Optimization    │
         │  Engine          │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Recommendations│
         │  (Top 3-5)      │
         └──────────────────┘
```

## 📦 Module Structure

### Core Modules

```
lib/
├── prediction-engine.ts      # ML algorithms
│   ├── generatePredictions()  # LSTM predictions
│   ├── detectAnomalies()      # Anomaly detection
│   └── optimizeBudget()        # Budget optimization
│
├── mock-data.ts               # Data models & mocks
│   ├── User interface
│   ├── Budget interface
│   ├── Transaction interface
│   └── Utility functions
│
└── utils.ts                   # Helper functions
    ├── formatCurrency()
    ├── calculateDays()
    └── date utilities

hooks/
├── use-insights-store.ts      # Zustand store
│   ├── ML insights state
│   ├── Gamification state
│   └── Persistence middleware
│
├── use-mobile.ts              # Responsive hook
└── use-toast.ts               # Notification hook

components/
├── dashboard/                 # Dashboard components
│   ├── intelligent-insights.tsx
│   ├── gamification-panel.tsx
│   └── balance-overview.tsx
│
├── budget/                    # Budget components
│   ├── budget-optimization-banner.tsx
│   ├── priority-manager.tsx
│   └── budget-setup.tsx
│
└── ui/                        # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    └── [shadcn components]
```

## 🗄️ Data Schema

### TypeScript Interfaces

```typescript
// User Data
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  university: string
  phone: string
  balance: number
  totalSavings: number
  joinedDate: string
}

// Budget Structure
interface Budget {
  id: string
  userId: string
  totalAmount: number
  dailyLimit: number
  startDate: string
  endDate: string
  priorities: Priority[]
  status: "active" | "completed" | "paused"
}

interface Priority {
  id: string
  name: string
  tier: 1 | 2 | 3
  dailyAllocation: number
  color: string
  icon: string
}

// Transaction
interface Transaction {
  id: string
  userId: string
  vendorId?: string
  amount: number
  description: string
  category: string
  date: string
  status: "completed" | "pending" | "failed"
  receiptUrl?: string
}

// ML Insights
interface MLInsights {
  predictions: Prediction[]
  anomalies: AnomalyAlert[]
  lastUpdated: string
}

interface Prediction {
  date: string
  predictedAmount: number
  confidence: number
  category: string
  upperBound: number
  lowerBound: number
}

interface AnomalyAlert {
  id: string
  type: "transaction" | "daily" | "category" | "pattern"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  riskScore: number
  timestamp: string
  category?: string
  amount?: number
  dismissed: boolean
}

// Gamification
interface GamificationState {
  points: number
  level: number
  levelProgress: number
  currentStreak: number
  longestStreak: number
  badges: Badge[]
  achievements: Achievement[]
  lastUpdated: string
}

interface Badge {
  id: string
  name: string
  icon: string
  earned: boolean
  earnedDate?: string
}

interface Achievement {
  id: string
  name: string
  progress: number
  target: number
  icon: string
  priority: "high" | "medium" | "low"
}
```

## 🔌 API Structure (Future)

### RESTful API Endpoints

```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

User:
  GET    /api/users/:id
  PUT    /api/users/:id
  DELETE /api/users/:id

Transactions:
  GET    /api/transactions
  POST   /api/transactions
  GET    /api/transactions/:id
  PUT    /api/transactions/:id
  DELETE /api/transactions/:id

Budget:
  GET    /api/budgets
  POST   /api/budgets
  GET    /api/budgets/:id
  PUT    /api/budgets/:id
  DELETE /api/budgets/:id

ML Services:
  POST   /api/ml/predict
  POST   /api/ml/detect-anomaly
  POST   /api/ml/optimize-budget

Gamification:
  GET    /api/gamification/:userId
  POST   /api/gamification/points
  POST   /api/gamification/badges
```

## 🧪 Testing Strategy

### Test Architecture

```
Unit Tests:
  ├── Components (React Testing Library)
  ├── Utilities (Jest)
  ├── ML Algorithms (Jest)
  └── State Management (Zustand)

Integration Tests:
  ├── User flows
  ├── Data persistence
  └── ML processing

E2E Tests:
  ├── Critical user journeys
  ├── Budget creation flow
  └── Payment processing

Performance Tests:
  ├── Load time
  ├── ML inference speed
  └── Memory usage
```

## 🚀 Deployment Architecture

### Current: Static Deployment (Netlify)

```
GitHub Repository
    │
    ▼
Netlify Build
    │
    ├── Install Dependencies
    ├── Build Next.js App
    └── Deploy Static Files
    │
    ▼
CDN Distribution
    │
    ▼
User Browser
```

### Future: Full-Stack Deployment

```
┌─────────────────┐
│   CDN (Static)   │
│   (Next.js App)  │
└────────┬─────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   API Gateway    │
│   (Rate Limiting)│
└────────┬─────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Auth       │ │  Business   │ │  ML         │
│  Service    │ │  Logic      │ │  Service    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Database    │
              │  (PostgreSQL)│
              └─────────────┘
```

## 📈 Scalability Considerations

### Current Architecture (Client-Side Only)

**Strengths:**
- No server costs
- Works offline
- Privacy-preserving
- Fast initial load

**Limitations:**
- Limited by browser storage (5-10MB)
- No real-time collaboration
- ML models limited by client performance

### Future Scalability

**Horizontal Scaling:**
- Microservices architecture
- Load balancing
- Database sharding
- CDN for static assets

**Performance Optimization:**
- Caching layers (Redis)
- Database indexing
- API response compression
- Lazy loading

**ML Scaling:**
- Model serving (TensorFlow Serving)
- Batch processing for predictions
- Model versioning
- A/B testing

---

**This architecture document provides the technical foundation for understanding and extending UniGuard Wallet.**

