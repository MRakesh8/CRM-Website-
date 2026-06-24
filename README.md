# NexusCRM 🚀

NexusCRM is a premium, highly scalable, and secure Customer Relationship Management system designed for modern enterprises. Built with a robust technology stack, it provides comprehensive features for managing users, clients, projects, tasks, leads, tickets, and finances out-of-the-box.

![NexusCRM Showcase](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3)

---

## ✨ Features

- **🛡️ Enterprise Role-Based Access Control (RBAC):** Super Admin, Admin, Manager, and Employee roles with granular permissions down to the action level.
- **📊 Comprehensive Dashboards:** Real-time metrics on revenue, pipeline status, and recent activity.
- **💼 Client & Lead Management:** Full tracking from prospect to active client.
- **📂 Project & Task Tracking:** Manage budgets, timelines, assignees, and real-time task progression.
- **💰 Invoicing & Payments:** Seamless financial tracking directly linked to projects.
- **🎫 Ticketing Support System:** Resolve client issues efficiently with priorities and status workflows.
- **🔒 Secure Architecture:** End-to-end request validation using Zod to strictly enforce data integrity.

---

## 🏗️ Architecture

The codebase is organized into a clean, modern monorepo structure:

```mermaid
graph TD
    A[Monorepo Root]
    A -->|React + Vite| B(frontend/)
    A -->|Express + Zod| C(backend/)
    A -->|PostgreSQL + Drizzle| D(database/)
    A -->|OpenAPI Specs| E(lib/)
```

### 🛠️ Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS v4, React Query, Radix UI.
- **Backend:** Node.js, Express.js, Zod (Strict Validation Middleware), Pino (Logging).
- **Database:** PostgreSQL, Drizzle ORM.
- **Tooling:** PNPM Workspaces, TypeScript, OpenAPI codegen.

---

## 🚀 How It Works

NexusCRM employs a strictly typed, API-first architecture:
1. **API Definitions:** Everything originates from OpenAPI specifications (`lib/api-spec`).
2. **Auto-generation:** React Query hooks and Zod schemas are automatically generated.
3. **Data Security:** The Express `backend` intercepts all incoming requests and rigorously validates them against the generated Zod schemas, completely preventing bad data and injection attacks.
4. **Data Persistence:** Validated requests are safely executed against the PostgreSQL `database` via Drizzle ORM.
5. **Interactive UI:** The React `frontend` consumes this data securely, rendering premium interfaces.

---

## 🌐 Hosting Guide

NexusCRM is designed for modern serverless and PaaS environments.

### 1. Frontend Hosting (Highly Recommended: Vercel)
Vercel is the ultimate platform for hosting Vite-based React applications, offering edge-caching and instantaneous global deployments.
- Create a Vercel project pointing to the `frontend/` directory.
- Set the Build Command to: `pnpm run build`
- Output Directory: `dist`
- Add the `VITE_API_URL` environment variable pointing to your backend url.

### 2. Database Hosting (Highly Recommended: Supabase)
Supabase provides managed, highly scalable PostgreSQL databases.
- Create a new project on [Supabase](https://supabase.com).
- Copy the **Connection String (URI)**.
- **Note:** For serverless environments, ensure you use Supabase's transaction connection pooler URL (usually port `6543`).

### 3. Backend Hosting (Highly Recommended: Railway or Render)
Because the `backend` uses Express.js (a persistent Node server), a standard PaaS like **Railway** or **Render** is recommended over serverless functions.
- Deploy the `backend/` directory.
- Add your `DATABASE_URL` (from Supabase) and `JWT_SECRET` as environment variables.
- Set the Build Command: `pnpm run build`
- Set the Start Command: `pnpm run start`

---

## 👨‍💻 Local Development Setup

### Prerequisites
- Node.js (v24+)
- PNPM (v11+)
- PostgreSQL Database

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up your `.env` file at the root:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/crm"
   SUPER_ADMIN_EMAIL="admin@yourcompany.com"
   JWT_SECRET="your_secure_secret"
   ```
4. Run database migrations and seeds:
   ```bash
   pnpm --filter @workspace/database run db:push
   pnpm --filter @workspace/database run db:seed
   ```
5. Start the development servers:
   ```bash
   pnpm run dev
   ```
   *This concurrently starts the Express API and the Vite React frontend.*
