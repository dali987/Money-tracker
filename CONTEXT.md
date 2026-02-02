# CONTEXT.md - Application Logic & Data Flow

This document serves as the **Long-Term Memory** for the application's internal logic, data flow, and architecture. It explains _how_ the app works, not just _what_ it is.

---

## 1. High-Level Architecture

The application is a **Monolithic Full-Stack App** utilizing a custom server architecture:

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Express Server                              │
│  (backend/src/server.js)                                             │
├──────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────┐    ┌───────────────────────────────────┐    │
│   │   Better Auth      │    │         API Routes                │    │
│   │   /api/auth/*      │    │         /api/v1/*                 │    │
│   └────────────────────┘    └───────────────────────────────────┘    │
│                                           │                          │
│                              ┌────────────┴────────────┐             │
│                              │    Next.js Handler      │             │
│                              │    (All other routes)   │             │
│                              └─────────────────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
                                       │
                              ┌────────┴────────┐
                              │    MongoDB      │
                              │   (Mongoose)    │
                              └─────────────────┘
```

- **Frontend:** Next.js 16 (App Router) for the UI, uses TypeScript.
- **Backend:** Custom Express.js 5 server (`backend/src/server.js`) that handles API requests and serves the Next.js app.
- **Database:** MongoDB (via Mongoose) for data persistence.
- **Auth:** Better Auth handles authentication via HTTP-only session cookies.

---

## 2. Data Flow (Frontend to Backend)

The application follows a strict **Unidirectional Data Flow** pattern:

```
┌──────────┐     ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  UI      │───▶│ Zustand      │───▶│ API Client  │───▶│ Axios        │
│ Component│     │ Store Action │    │ (lib/api/*) │    │ (HTTP req)   │
└──────────┘     └──────────────┘    └─────────────┘    └──────┬───────┘
                                                              │
     ┌─────────────────────────────────────────────────────────▼
     │
┌────▼─────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Express │───▶│ Auth         │───▶│ Controller  │───▶│  MongoDB     │
│  Router  │    │ Middleware   │    │             │    │  (Mongoose)  │
└──────────┘    └──────────────┘    └─────────────┘    └──────────────┘
```

### Detailed Flow:

1. **UI Component Event:** User interacts (e.g., "Create Transaction").
2. **Zustand Store Action:** Component calls a method from a global store (e.g., `useTransactionStore.createTransaction`).
3. **API Client Layer:** Store action calls a typed API function (e.g., `transactionApi.create` in `frontend/lib/api/transactions.ts`).
4. **Network Request:** `Axios` instance sends a request to `/api/v1/...` with **HTTP-Only Cookies** attached automatically (`withCredentials: true`).
5. **Express Routing:**
    - Server receives request at `/api/v1/...`.
    - `authorizeToken` middleware (`auth.middleware.js`) verifies the Better Auth session.
    - If valid, it fetches the full User document from MongoDB (including settings like `currencies`, `tags`, `groups`) and attaches it to `req.user`.
6. **Controller Logic:** Request is routed to a controller (e.g., `transaction.controller.js`).
    - Validates input.
    - Uses MongoDB sessions for atomic operations where needed (transactions use `mongoose.startSession()`).
    - Performs DB operations via Mongoose.
    - Updates related entities (e.g., updating Account balance via `accountActions` utility).
7. **Response & State Update:**
    - Backend returns JSON data `{ success: boolean, data: T }`.
    - **Zustand Store** receives the data and updates the local state (`set({ transactions: [...] })`).
    - **Cross-Store Refresh:** Transaction mutations trigger `useAccountStore.getState().getAccounts()` to keep balances in sync.
    - **Toast Notifications:** Success/error toasts via `sonner`.

---

## 3. Authentication & Security

Authentication is handled by **Better Auth** with a hybrid approach:

### Session Flow:

```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│ auth-client  │───▶│ /api/auth/*   │───▶│ Better Auth  │
│ (React)      │    │ (Express)     │    │ (Session DB) │
└──────────────┘    └───────────────┘    └──────────────┘
```

### Key Components:

| Component        | Location                                     | Purpose                                                  |
| ---------------- | -------------------------------------------- | -------------------------------------------------------- |
| `authClient`     | `frontend/lib/auth-client.ts`                | Better Auth React client for login/signup/session checks |
| `useAuthStore`   | `frontend/store/useAuthStore.ts`             | Zustand store managing user state + settings             |
| `authorizeToken` | `backend/src/middlewares/auth.middleware.js` | Middleware that verifies session & hydrates `req.user`   |
| `auth`           | `backend/src/lib/auth.js`                    | Better Auth server configuration                         |

### Auth Middleware (`authorizeToken`):

1. Extracts session from request headers via `fromNodeHeaders`.
2. Calls `auth.api.getSession()` to verify the Better Auth session.
3. **Hydrates User:** Fetches the full `User` document from MongoDB (combining Auth data with App data like `currencies`, `tags`, `groups`).
4. Attaches user to `req.user` for downstream handlers.
5. Blocks unauthorized requests with 401.

### Route Protection:

- **API:** All `/api/v1/*` routes use `authorizeToken` middleware (except exchange rates).
- **UI:** `Provider.tsx` checks auth state on mount and redirects:
    - Unauthenticated users on protected routes → `/login`
    - Authenticated users on `/login` or `/signup` → `/dashboard`

### Public Routes:

```typescript
const PUBLIC_ROUTES = ['/', '/login', '/signup'];
```

---

## 4. State Management

We use a **Hybrid Approach** combining Zustand and React Query:

### Zustand Stores (Global Client State)

| Store                  | File                            | Purpose                                                                                                 |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `useAuthStore`         | `store/useAuthStore.ts`         | User session, login/signup actions, user settings (CRUD for arrays like `currencies`, `tags`, `groups`) |
| `useTransactionStore`  | `store/useTransactionStore.ts`  | Transactions array, filtering, chart data, exchange rates                                               |
| `useAccountStore`      | `store/useAccountStore.ts`      | Accounts list, balances, account summary                                                                |
| `useBudgetStore`       | `store/useBudgetStore.ts`       | Budget limits and CRUD operations                                                                       |
| `useNotificationStore` | `store/useNotificationStore.ts` | In-app notifications (persisted to localStorage)                                                        |

### React Query (Server State)

| Hook              | File                       | Purpose                                         |
| ----------------- | -------------------------- | ----------------------------------------------- |
| `useAccounts`     | `hooks/useAccounts.ts`     | Fetches accounts with caching (5-min staleTime) |
| `useTransactions` | `hooks/useTransactions.ts` | Fetches transactions with filters               |

**Pattern:** Most data fetching uses **Zustand manual actions** (fetch → set state), but some components use React Query for its caching benefits.

### Cross-Store Communication:

```typescript
// In useTransactionStore.createTransaction:
useAccountStore.getState().getAccounts(); // Refresh accounts after mutation
```

---

## 5. Key Features & Control Files

### 5.1 Transactions

| Layer                  | File                                          | Key Functions                                                                              |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Frontend Store**     | `store/useTransactionStore.ts`                | `createTransaction`, `updateTransaction`, `deleteTransaction`, `getTransactionsWithFilter` |
| **Frontend API**       | `lib/api/transactions.ts`                     | `transactionApi.create`, `getSummary`, `getChart`, `getNetWorthChart`                      |
| **Frontend Component** | `Components/transactions/TransactionForm.tsx` | Unified form for create/edit, supports regular & recurring                                 |
| **Backend Controller** | `controllers/transaction.controller.js`       | CRUD + aggregation pipelines for charts                                                    |
| **Backend Model**      | `models/transaction.model.js`                 | Schema: `type`, `amount`, `fromAccount`, `toAccount`, `tags`, `date`                       |

**Critical Logic:**

- Creating/updating/deleting transactions uses MongoDB sessions for atomicity.
- `accountActions` utility automatically adjusts account balances:
    - `income` → increases `toAccount` balance
    - `expense` → decreases `fromAccount` balance
    - `transfer` → moves money between accounts

### 5.2 Accounts

| Layer                  | File                                | Key Functions                                                                          |
| ---------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| **Frontend Store**     | `store/useAccountStore.ts`          | `getAccounts`, `createAccount`, `updateAccount`, `deleteAccount`, `getAccountsSummary` |
| **Frontend API**       | `lib/api/accounts.ts`               | Standard CRUD + summary endpoint                                                       |
| **Backend Controller** | `controllers/account.controller.js` | CRUD operations                                                                        |
| **Backend Model**      | `models/account.model.js`           | Schema: `name`, `balance`, `currency`, `group`                                         |

### 5.3 Budgets

| Layer                  | File                               | Key Functions                                                |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------ |
| **Frontend Store**     | `store/useBudgetStore.ts`          | `getBudgets`, `createBudget`, `updateBudget`, `deleteBudget` |
| **Frontend API**       | `lib/api/budget.ts`                | Standard CRUD                                                |
| **Backend Controller** | `controllers/budget.controller.js` | CRUD with tag-uniqueness validation                          |
| **Backend Model**      | `models/budget.model.js`           | Schema: `tag`, `amount`, `period`, `alertThreshold`          |

**Key Logic:** Budgets are per-tag monthly limits. The `useNotificationTriggers` hook checks spending against budgets and triggers warnings at threshold (default 80%) and when exceeded.

### 5.4 Recurring Transactions

| Layer                  | File                                        | Key Functions                                               |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| **Frontend Page**      | `app/recurring/page.tsx`                    | Lists recurring rules, provides edit/delete UI              |
| **Frontend Component** | `Components/transactions/RecurringForm.tsx` | Form for creating recurring rules                           |
| **Frontend API**       | `lib/api/recurring.ts`                      | CRUD operations                                             |
| **Backend Controller** | `controllers/recurring.controller.js`       | CRUD + `processDueRecurringTransactions`                    |
| **Backend Model**      | `models/recurringTransaction.model.js`      | Schema: `frequency`, `nextRunDate`, `lastRunDate`, `active` |

**Cron Job Logic (server.js):**

```javascript
cron.schedule('0 0 * * *', processDueRecurringTransactions); // Runs daily at midnight
```

- On startup AND daily cron: finds all active recurring rules where `nextRunDate <= today`.
- Creates actual Transaction records.
- Updates account balances via `accountActions`.
- Calculates and sets `nextRunDate` based on `frequency` (daily/weekly/monthly/yearly).

### 5.5 Exchange Rates

| Layer                  | File                                 | Key Functions                                                                            |
| ---------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Frontend Store**     | `store/useTransactionStore.ts`       | `getRates`, `getCurrencies` (stores in `rates`, `currencies` state)                      |
| **Frontend API**       | `lib/api/exchange.ts`                | `getRates`, `getCurrencies`, `convertCurrency`                                           |
| **Backend Controller** | `controllers/exchange.controller.js` | `fetchAndSaveExchangeRates`, `checkExchangeRates`, `convertCurrency`, `getAllCurrencies` |
| **Backend Model**      | `models/exchangeRates.model.js`      | Single-document store for rates from ExchangeRate-API                                    |

**Cron Job Logic (server.js):**

```javascript
cron.schedule('0 0 * * *', checkExchangeRates); // Runs daily at midnight
```

- On startup: checks if rates exist and if they're older than 1 day.
- Fetches from ExchangeRate-API if needed, stores in MongoDB.
- Used for multi-currency net worth calculations.

### 5.6 User Settings

| Layer                  | File                             | Key Functions                                                                       |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| **Frontend Store**     | `store/useAuthStore.ts`          | `updateSetting`, `addSetting`, `removeSetting`                                      |
| **Frontend Page**      | `app/settings/page.tsx`          | UI for managing currencies, groups, tags, base currency                             |
| **Frontend API**       | `lib/api/user.ts`                | `updateSetting`, `addSetting`, `removeSetting`                                      |
| **Backend Controller** | `controllers/user.controller.js` | Setting CRUD with validation                                                        |
| **Backend Model**      | `models/user.model.js`           | Extended Better Auth user with `currencies[]`, `baseCurrency`, `groups[]`, `tags[]` |

**Base Currency Change Logic:**
When `baseCurrency` is updated, the controller:

1. Fetches exchange rates.
2. Calculates conversion multiplier.
3. Batch-updates ALL user's account balances.
4. Batch-updates ALL user's transaction amounts.

### 5.7 Reports & Charts

| Layer                   | File                                                     | Key Functions                                                        |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| **Frontend Page**       | `app/reports/page.tsx`                                   | Period-based charts (monthly/yearly), income/expense/net-worth views |
| **Frontend Components** | `Components/charts/LineChart.tsx`, `HorizontalChart.tsx` | Recharts-based visualizations                                        |
| **Backend Endpoints**   | `transaction.controller.js`                              | `getTransactionChartData`, `getNetWorthChartData`                    |

**Chart Data Flow:**

1. User selects period (monthly/yearly) and chart type.
2. Frontend calculates `startDate`, `endDate`, `groupBy`.
3. Calls `transactionApi.getChart()` or `transactionApi.getNetWorthChart()`.
4. Backend aggregation pipeline groups by day/month, calculates income/expense sums.
5. Frontend transforms data for Recharts format.

### 5.8 Notifications (In-App)

| Layer         | File                                             | Purpose                                                                     |
| ------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| **Store**     | `store/useNotificationStore.ts`                  | Persisted notification list (max 50, uses localStorage via Zustand persist) |
| **Hook**      | `hooks/useNotificationTriggers.ts`               | Automated alerts for negative balances and budget thresholds                |
| **Component** | `Components/notifications/NotificationPanel.tsx` | UI for viewing/dismissing notifications                                     |

**Trigger Conditions:**

- **Negative Balance:** Account balance < 0 → Error notification.
- **Budget Warning:** Spending ≥ `alertThreshold`% → Warning notification.
- **Budget Exceeded:** Spending ≥ 100% → Error notification.

---

## 6. Custom Hooks

| Hook                      | File                               | Purpose                                                                 |
| ------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| `useKeyboardShortcuts`    | `hooks/useKeyboardShortcuts.ts`    | Global navigation shortcuts (Alt+D=Dashboard, Alt+T=Transactions, etc.) |
| `useNotificationTriggers` | `hooks/useNotificationTriggers.ts` | Auto-generates notifications based on account/budget state              |
| `useAccounts`             | `hooks/useAccounts.ts`             | React Query wrapper for accounts with caching                           |
| `useTransactions`         | `hooks/useTransactions.ts`         | React Query wrapper for transactions                                    |

---

## 7. Directory Map (Quick Reference)

### Frontend (`/frontend`)

```
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── dashboard/                # Main dashboard
│   ├── transactions/             # Transaction list & management
│   ├── accounts/                 # Account management
│   ├── budget/                   # Budget management
│   ├── recurring/                # Recurring transactions
│   ├── reports/                  # Charts & reports
│   ├── settings/                 # User settings
│   ├── Constants.js              # App-wide constants (categories, etc.)
│   └── layout.tsx                # Root layout with Provider
├── Components/
│   ├── Custom/                   # Reusable UI primitives (modals, inputs, dropdowns)
│   ├── charts/                   # Recharts-based chart components
│   ├── dashboard/                # Dashboard-specific components (NetWorth)
│   ├── layout/                   # NavBar, Header, ThemeToggle
│   ├── providers/                # Provider.tsx, Initializer.tsx
│   ├── states/                   # Skeleton loaders, empty states
│   ├── transactions/             # Transaction forms, lists, items
│   └── notifications/            # Notification panel
├── hooks/                        # Custom React hooks
├── lib/
│   ├── api/                      # Typed API client functions
│   ├── auth-client.ts            # Better Auth React client
│   ├── axios.js                  # Configured Axios instance
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── validations.ts            # Zod schemas
├── store/                        # Zustand stores
└── types/                        # TypeScript type definitions
```

### Backend (`/backend/src`)

```
├── server.js                     # Entry point, Express setup, cron jobs
├── controllers/                  # Request handlers
│   ├── account.controller.js
│   ├── budget.controller.js
│   ├── exchange.controller.js
│   ├── recurring.controller.js
│   ├── transaction.controller.js
│   └── user.controller.js
├── models/                       # Mongoose schemas
│   ├── account.model.js
│   ├── budget.model.js
│   ├── exchangeRates.model.js
│   ├── recurringTransaction.model.js
│   ├── transaction.model.js
│   └── user.model.js
├── routes/                       # Express route definitions
├── middlewares/
│   ├── auth.middleware.js        # authorizeToken, optionalAuth
│   ├── error.middleware.js       # Centralized error handling
│   └── rateLimit.middleware.js   # API rate limiting
├── lib/
│   ├── auth.js                   # Better Auth configuration
│   └── env.js                    # Environment variable validation
├── utils/
│   └── accountActions.js         # Balance update utilities
└── database/
    └── mongodb.js                # MongoDB connection
```

---

## 8. Security Features

| Feature               | Implementation                                                  |
| --------------------- | --------------------------------------------------------------- |
| **Session Auth**      | HTTP-only cookies via Better Auth                               |
| **Rate Limiting**     | `apiLimiter` middleware on `/api/v1/*`                          |
| **Helmet Headers**    | CSP, XSS protection, etc.                                       |
| **Input Validation**  | Zod schemas (frontend forms), controller-level checks (backend) |
| **Atomic Operations** | MongoDB sessions for transaction/account updates                |
| **CORS**              | Configured in Axios instance with `withCredentials: true`       |

---

## 9. UI Patterns

### Component Hierarchy (Example: Dashboard)

```
DashboardPage
├── Initializer (fetches rates on mount)
├── NetWorth (displays account summary)
│   └── Uses useAccountStore + exchange rates
├── CustomCollapse ("New Transaction")
│   └── TransactionForm (tabbed expense/income/transfer)
│       └── Uses useTransactionStore for submit
└── CustomCollapse ("Recent Transactions")
    └── TransactionsList (paginated, limited to 6)
        └── Uses useTransactionStore
```

### Animation Patterns

- **Framer Motion** for page transitions and micro-interactions.
- **AnimatePresence** for tab/modal transitions.
- **Staggered children** for list animations.

### Form Patterns

- **React Hook Form** is NOT used despite being in package.json.
- Forms use controlled components with local state.
- Validation at submit time (not inline).

---

## 10. Data Models Summary

### User

```javascript
{
  // Better Auth fields
  name: String,
  email: String (unique),
  emailVerified: Boolean,
  image: String,

  // App-specific fields
  username: String (unique, sparse),
  currencies: [String],         // e.g., ['EUR', 'USD']
  baseCurrency: String,         // e.g., 'USD'
  groups: [String],             // Account groups, e.g., ['Cash', 'Bank', 'Credit']
  tags: [String],               // Transaction tags
  profilePic: String
}
```

### Account

```javascript
{
  user: ObjectId,       // Better Auth user ID (stored as 'user', not 'userId')
  name: String,
  balance: Number,
  currency: String,
  group: String         // References user.groups
}
```

### Transaction

```javascript
{
  type: 'income' | 'expense' | 'transfer',
  fromAccount: ObjectId,     // For expense/transfer
  toAccount: ObjectId,       // For income/transfer
  amount: Number,
  description: String,
  note: String,              // UI uses this instead of description
  date: Date,
  tags: [String]
}
```

### RecurringTransaction

```javascript
{
  user: ObjectId,
  type: 'income' | 'expense' | 'transfer',
  fromAccount: ObjectId,
  toAccount: ObjectId,
  amount: Number,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  nextRunDate: Date,         // Calculated automatically
  lastRunDate: Date,
  active: Boolean,
  description: String,
  tags: [String]
}
```

### Budget

```javascript
{
  userId: ObjectId,
  tag: String,               // Unique per user
  amount: Number,
  period: String,            // Currently always 'monthly'
  alertThreshold: Number     // Percentage (default 80)
}
```

### ExchangeRates

```javascript
{
  // Single document in collection
  base: String,              // 'USD'
  rates: Map<String, Number>,  // Currency code → rate
  timeLastUpdateUtc: String,
  lastFetchedAt: Date
}
```

---

## 11. API Endpoints Summary

All endpoints are prefixed with `/api/v1/` and require authentication unless noted.

| Endpoint                       | Method | Description                           |
| ------------------------------ | ------ | ------------------------------------- |
| **Transactions**               |        |                                       |
| `/transaction`                 | GET    | Get filtered transactions             |
| `/transaction/summary`         | GET    | Get income/expense totals             |
| `/transaction/chart`           | GET    | Get chart data (grouped by day/month) |
| `/transaction/net-worth-chart` | GET    | Get net worth trend data              |
| `/transaction/create`          | POST   | Create transaction                    |
| `/transaction/update/:id`      | PUT    | Update transaction                    |
| `/transaction/delete/:id`      | DELETE | Delete transaction                    |
| **Accounts**                   |        |                                       |
| `/account`                     | GET    | Get all accounts                      |
| `/account/summary`             | GET    | Get net worth by group                |
| `/account/create`              | POST   | Create account                        |
| `/account/update/:id`          | PUT    | Update account                        |
| `/account/delete/:id`          | DELETE | Delete account                        |
| **Budgets**                    |        |                                       |
| `/budget`                      | GET    | Get all budgets                       |
| `/budget/create`               | POST   | Create budget                         |
| `/budget/update/:id`           | PUT    | Update budget                         |
| `/budget/delete/:id`           | DELETE | Delete budget                         |
| **Recurring**                  |        |                                       |
| `/recurring`                   | GET    | Get all recurring rules               |
| `/recurring/create`            | POST   | Create recurring rule                 |
| `/recurring/update/:id`        | PUT    | Update recurring rule                 |
| `/recurring/delete/:id`        | DELETE | Delete recurring rule                 |
| **User**                       |        |                                       |
| `/user`                        | GET    | Get current user profile              |
| `/user/update`                 | POST   | Update a setting (replace)            |
| `/user/add`                    | POST   | Add to array setting                  |
| `/user/remove`                 | POST   | Remove from array setting             |
| **Exchange**                   |        |                                       |
| `/exchange/rates`              | GET    | Get exchange rates                    |
| `/exchange/currencies`         | GET    | Get all available currencies          |
| `/exchange/convert`            | GET    | Convert between currencies            |

---

## 12. Known Patterns & Quirks

1. **Account Field Naming:** Backend uses `user` for user reference, frontend types show `userId` - be aware of this mismatch.

2. **Transaction Account Fields:** Transactions have both legacy fields (`fromAccount`/`toAccount` as strings in some UI code) and proper ObjectId references.

3. **Zustand Cross-Store Calls:** Transaction mutations explicitly call `useAccountStore.getState().getAccounts()` - this is intentional for keeping balances synchronized.

4. **React Query + Zustand Coexistence:** Some components use React Query hooks (e.g., `useAccounts`), while most use Zustand stores. React Query provides caching benefits.

5. **Notification Deduplication:** `useNotificationTriggers` uses refs to prevent duplicate notifications within the same session.

6. **Base Currency Conversion:** Changing base currency triggers a batch update of ALL accounts AND transactions - this is expensive but ensures consistency.


- By Opus 4.5 (he cooked)