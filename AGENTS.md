# Project Overview: Money Tracker

This document serves as the **Source of Truth** for AI Agents working on this project. It outlines the technology stack, project structure, and coding conventions that **MUST** be followed.

## 1. Technology Stack

### **Frontend** (`/frontend`)

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**:
    - **Tailwind CSS v4**
    - **DaisyUI v5**
    - **Framer Motion** & **GSAP** (Animations)
- **State Management**:
    - **Zustand** (Global Client State)
    - **TanStack React Query** (Server State / Data Fetching)
- **Forms**: React Hook Form + Zod Validation
- **Icons**: Lucide React
- **Auth**: Better Auth (Client)
- **HTTP Client**: Axios

### **Backend** (`/backend`)

- **Framework**: Express.js 5
- **Language**: JavaScript (ES Modules / `"type": "module"`)
- **Database**: MongoDB (via Mongoose)
- **Auth**: Better Auth (Server)
- **Validation**: Zod
- **Runtime**: Node.js (with Nodemon for dev)

---

## 2. Project Structure

### **Frontend Structure**

The frontend does **NOT** use a `src` directory. All major directories represent the root alias `@/`.

- **`app/`**: Next.js App Router pages and layouts.
- **`Components/`**:
    - **`Custom/`**: Reusable generic UI components (e.g., `CustomModal`, Inputs). **Prefer using these over raw HTML/Tailwind.**
    - **`ui/`**: Specialized or shadcn-like components (if any).
    - (Root `Components/`): Feature-specific components (e.g., `TransactionForm`, `NavBar`).
- **`lib/`**: Utilities, Axios instance (`axios.js`), and helper functions.
- **`hooks/`**: Custom React hooks (e.g., `useKeyboardShortcuts`).
- **`store/`**: Zustand stores.

### **Backend Structure**

Source code is located in `backend/src/`.

- **`controllers/`**: Request handlers.
- **`models/`**: Mongoose schemas and models.
- **`routes/`**: Express route definitions.
- **`services/`**: Business logic layer (if applicable).
- **`middlewares/`**: Express middlewares (auth, validation, etc.).
- **`utils/`**: Helper functions.
- **`server.js`**: Entry point.

---

## 3. Rules & Conventions

### **General Code Quality**

1.  **Type Safety**: STRICTLY enforce TypeScript in the frontend. No `any` types unless absolutely unavoidable.
2.  **ES Modules**: The backend uses strict ES Modules. Use `import/export` syntax, not `require`.
3.  **Naming**:
    - Components: `PascalCase` (e.g., `TransactionForm.tsx`).
    - Files/Directories: `camelCase` or `kebab-case` generally, but match existing patterns (`backend/src` structure suggests `camelCase` or `kebab-case` for utils/routes).

### **Frontend Development**

1.  **Styling**:
    - Use **Tailwind CSS** for layout and spacing.
    - Use **DaisyUI** classes for component primitives (buttons, inputs) when applicable.
    - Do **NOT** write custom CSS/SCSS files unless for complex animations not achievable with Tailwind.
2.  **Components**:
    - Check `Components/Custom` before building a new UI primitive.
    - Use `CustomModal` for all modal interactions to ensure consistent behavior (animations, keyboard closure).
3.  **State**:
    - Use **React Query** for all server-side data fetching and caching.
    - Use **Zustand** only for client-only global state (e.g., UI preferences).
4.  **Forms**:
    - Always use `react-hook-form` coupled with `zod` schema validation.

### **Backend Development**

1.  **Structure**: Follow the Controller-Service-Model pattern. keep controllers thin.
2.  **Validation**: Validate ALL incoming request bodies using **Zod** schemas in the middleware or controller.
3.  **Error Handling**: Use a centralized error handling mechanism (or consistent try/catch with response helpers).

---

## 4. Workflows (For Agents)

- **Before Changes**: Always read the file first. If modifying UI, check `Components/Custom` first.
- **New Features**: Create a plan separating Frontend and Backend tasks.
- **Testing**: Ensure changes in Backend are reflected in Frontend types/interfaces if necessary (manual sync required as backend is JS).
