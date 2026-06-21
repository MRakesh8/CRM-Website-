import { cn } from "@/lib/utils";

type StatusType = "client" | "lead" | "project" | "task" | "invoice" | "payment" | "ticket" | "user";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  let variantClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  
  // Custom logic based on type and status
  if (type === "client") {
    if (s === "active") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (s === "prospect") variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
  } else if (type === "project") {
    if (s === "completed") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "in_progress") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "testing") variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "cancelled") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
  } else if (type === "invoice") {
    if (s === "paid") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "sent") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "overdue") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
  } else if (type === "payment") {
    if (s === "paid") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "pending") variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "failed") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
    if (s === "refunded") variantClass = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
  } else if (type === "ticket") {
    if (s === "resolved" || s === "closed") variantClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    if (s === "in_progress") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "open") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
  } else if (type === "user") {
    if (s === "active") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "suspended") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
  } else if (type === "task") {
    if (s === "done") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "in_progress") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "review") variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (type === "lead") {
    if (s === "won") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "lost") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
    if (s === "negotiation") variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "contacted" || s === "interested" || s === "proposal_sent") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  }

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", variantClass, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string, className?: string }) {
  const p = priority.toLowerCase();
  let variantClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  
  if (p === "medium") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  if (p === "high") variantClass = "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
  if (p === "urgent") variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", variantClass, className)}>
      {priority}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: string, className?: string }) {
  const r = role.toLowerCase();
  let variantClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
  
  if (r === "super_admin") variantClass = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
  if (r === "manager") variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  if (r === "employee") variantClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  if (r === "client") variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", variantClass, className)}>
      {role.replace(/_/g, ' ')}
    </span>
  );
}
