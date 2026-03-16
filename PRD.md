# Product Requirements Document (PRD): Money Tracker

## 1. Project Overview
**Money Tracker** is a personal finance management application designed to help users track income, expenses, and transfers across multiple accounts and currencies. It provides insights into spending habits through reports, manages recurring transactions, and helps users stay within budget limits.

## 2. Target Audience
- Individuals looking to organize their daily finances.
- Users who manage multiple accounts (Cash, Bank, Credit).
- Users who need multi-currency support with automated exchange rates.

## 3. Key Features

### 3.1 Core Functionality
- **Transaction Management**: Create, view, update, and delete income, expense, and transfer transactions.
- **Account Management**: Manage multiple accounts with real-time balance tracking.
- **Automated Balances**: Account balances automatically adjust when transactions are logged.
- **Multi-Currency**: Support for multiple currencies with daily updated exchange rates.

### 3.2 Advanced Features
- **Recurring Transactions**: Set up daily, weekly, monthly, or yearly automated transactions.
- **Budgeting**: Set monthly spending limits per tag with automated alerts at 80% and 100% threshold.
- **Reports & Data Vis**: 
  - Net worth trend charts.
  - Income vs. Expense breakdowns.
  - Periodic filtering (Monthly/Yearly).
- **Global Settings**: Manage custom tags, account groups, and supported currencies.

### 3.3 Security & UX
- **Authentication**: Secure login and session management via Better Auth.
- **Responsive Design**: Modern UI built with Tailwind CSS v4 and DaisyUI v5.
- **Performance**: High-speed interactions using Zustand for local state and React Query for server data.
- **Keyboard Shortcuts**: Power-user shortcuts for quick navigation.

## 4. Technical Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Framer Motion, GSAP.
- **Backend**: Express.js 5, Node.js, Mongoose.
- **Database**: MongoDB.
- **Auth**: Better Auth (Session-based via HTTP-only cookies).
- **Communication**: REST API via Axios.

## 5. User Workflow
1. **Onboarding**: User creates an account.
2. **Setup**: User defines their accounts (e.g., "Main Bank", "Wallet") and base currency.
3. **Daily Use**: User logs daily expenses or transfers.
4. **Automation**: Recurring rules (like rent or salary) execute automatically.
5. **Review**: User checks the Dashboard or Reports to see financial trends and budget status.

## 6. Project structure
- `/frontend`: Next.js application.
- `/backend`: Express API and Database models.
