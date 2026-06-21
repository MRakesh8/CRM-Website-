# NexusCRM

A full-featured CRM application for managing clients, leads, projects, tasks, invoices, payments, support tickets, team members, and calendar events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui (artifacts/crm)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → lib/api-client-react, lib/api-zod)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema.ts` — DB schema (source of truth for all tables)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit manually)
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/crm/src/pages/` — all CRM pages
- `artifacts/crm/src/components/dialogs/` — all CRUD dialogs
- `artifacts/crm/src/contexts/AuthContext.tsx` — auth state management

## Architecture decisions

- **Contract-first API**: OpenAPI spec is written first; Orval generates all client hooks and Zod schemas from it. Never edit generated files.
- **Token auth**: `base64(userId:email)` stored in `localStorage` key `nexuscrm_token`. `setAuthTokenGetter` is called in `main.tsx` so the custom fetch client injects the header on every request.
- **No demo data**: The app only shows real user-created data. Empty states guide users to create their first records.
- **Client-side filtering**: Detail pages (client-detail, project-detail) fetch all records and filter client-side by ID — avoids extra API endpoints.
- **Null → undefined in payloads**: API input types use `undefined` for optional fields, not `null`. All dialog `onSubmit` handlers use `?? undefined` to convert nullable form values before sending.

## Product

- **Dashboard**: KPI cards (revenue, clients, open leads, active projects, overdue tasks) + recent activity
- **Clients**: Full CRUD with detail view showing linked projects, invoices, and tickets
- **Leads**: Kanban board with drag-and-drop across pipeline stages
- **Projects**: Grid view with progress bars; detail view with task list
- **Tasks**: Kanban + table view with priority/status badges
- **Invoices**: Line-item invoice builder with tax/discount; printable detail view
- **Payments**: Payment recording linked to invoices and clients
- **Support Tickets**: Priority/status management with detail view
- **Calendar**: Event management (meetings, follow-ups, deadlines)
- **Team**: User management with role control
- **Notifications**: Read/unread notification center with badge counter

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After editing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks.
- After regenerating, run `pnpm run typecheck:libs` before checking leaf artifacts.
- Do not use `indicatorClassName` on the shadcn `<Progress>` component — it is not a valid prop.
- `useListNotifications` options format: `useListNotifications({ query: { ... } })` requires full `UseQueryOptions` with `queryKey`; simpler to just call `useListNotifications()` without options.
- Hook second-argument options (`{ query: { enabled } }`) differ from first-argument params (`ListProjectsParams`). Don't mix them up.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
