# CONTEXT.md - Application Logic & Data Flow

This document serves as the "Long-Term Memory" for the application's internal logic, data flow, and architecture. It explains _how_ the app works, not just _what_ it is.

## 1. High-Level Architecture

The application is a **Monolithic Full-Stack App** utilizing a custom server architecture:

- **Frontend:** Next.js (App Router) for the UI.
- **Backend:** Custom Express server (`backend/src/server.js`) that handles both API requests and serves the Next.js app.
- **Database:** MongoDB (via Mongoose) for data persistence.

## 2. Data Flow (Frontend to Backend)

The application follows a strict **Unidirectional Data Flow** pattern:

1.  **UI Component Event:** User interacts (e.g., "Create Transaction").
2.  **Zustand Store Action:** Component calls a method from a global store (e.g., `useTransactionStore.createTransaction`).
3.  **API Client Layer:** Store action calls a typed API function (e.g., `transactionApi.create` in `frontend/lib/api`).
4.  **Network Request:** `Axios` instance sends a request to `/api/v1/...` with **HTTP-Only Cookies** attached.
5.  **Express Routing:**
    - Server receives request.
    - `auth.middleware.js` verifies the session using `better-auth`.
    - If valid, it fetches the full User profile (including settings) from MongoDB and attaches it to `req.user`.
6.  **Controller Logic:** Request is routed to a controller (e.g., `transaction.controller.js`).
    - Validates input.
    - Performs DB operations (Mongoose).
    - Updates related entities (e.g., updating Account balance when a Transaction is created).
7.  **Response & State Update:**
    - Backend returns JSON data.
    - **Zustand Store** receives the data and updates the local state (`set({ transactions: [...] })`).
    - **Cross-Store Refresh:** Often, one action triggers another store to refresh (e.g., creating a transaction triggers `useAccountStore.getState().getAccounts()` to ensure balances are accurate).

## 3. Authentication & Security

Authentication is handled by **Better Auth** with a hybrid approach:

- **Session Management:** Sessions are stored in MongoDB and managed via secure, HTTP-only cookies.
- **Frontend Helper:** `auth-client.ts` (`better-auth/react`) checks session state on the client.
- **Backend Middleware:** `authorizeToken` in `auth.middleware.js`:
    1.  Verifies the Better Auth session.
    2.  **Hydrates User:** Fetches the full `User` document from MongoDB (combining Auth data with App data like `currencies`, `tags`).
    3.  Blocks unauthorized requests with 401.
- **Route Protection:**
    - **API:** Middleware protects sensitive endpoints.
    - **UI:** `Provider.tsx` checks auth state and redirects unauthenticated users to `/login`.

## 4. State Management (Zustand)

We use **Zustand** as the single source of truth for client state. Stores are split by domain:

- **`useAuthStore`:** Manages user session and login/signup actions.
- **`useTransactionStore`:**
    - Stores `transactions` array.
    - Handles filtering, sorting, and fetching summary/chart data.
    - **Critical:** Contains logic that auto-refreshes `useAccountStore` on mutations.
- **`useAccountStore`:** Stores account list and balances.
- **`useBudgetStore`:** Manages budget limits and progress.
- **`useNotificationStore`:** Handles app-wide notifications (distinct from "Toasts" which use Sonner).

**Note on React Query:** While `QueryClientProvider` is present in `Provider.tsx`, the primary data fetching pattern currently relies on **Manual Zustand Actions** (fetch -> set state) rather than React Query hooks.

## 5. Key Features & Control Files

| Feature            | Frontend Store                    | Backend Controller          | Key Logic                                                                                    |
| :----------------- | :-------------------------------- | :-------------------------- | :------------------------------------------------------------------------------------------- |
| **Transactions**   | `useTransactionStore.ts`          | `transaction.controller.js` | Updates Account balances automatically on create/delete.                                     |
| **Accounts**       | `useAccountStore.ts`              | `account.controller.js`     | Source of truth for where money "lives".                                                     |
| **Budgets**        | `useBudgetStore.ts`               | `budget.controller.js`      | set monthly limits per Category.                                                             |
| **Exchange Rates** | `useTransactionStore.ts` (helper) | `exchange.controller.js`    | **Cron Job** (`server.js`) updates rates weekly. Used for multi-currency conversions.        |
| **Recurring**      | N/A (Admin/Auto)                  | `recurring.controller.js`   | **Cron Job** (`server.js`) checks daily for due transactions and creates then automatically. |

## 6. Directory Map (Quick Reference)

- **Frontend Entry:** `frontend/app/layout.tsx` -> `frontend/Components/Provider.tsx`
- **Global Stores:** `frontend/store/*.ts`
- **API Definitions:** `frontend/lib/api/*.ts`
- **Backend Entry:** `backend/src/server.js`
- **Database Models:** `backend/src/models/*.js`
- **Auth Config:** `backend/src/lib/auth.js`
