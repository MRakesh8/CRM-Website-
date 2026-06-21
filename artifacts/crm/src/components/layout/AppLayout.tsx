import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  CreditCard, 
  Ticket, 
  Calendar as CalendarIcon, 
  Bell, 
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe, useLogout } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });
  const logout = useLogout();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/leads", label: "Leads", icon: ShieldAlert },
    { href: "/projects", label: "Projects", icon: Briefcase },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/tickets", label: "Tickets", icon: Ticket },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/team", label: "Team", icon: Users },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
        <div className="p-6">
          <div className="font-bold text-2xl tracking-tight">NexusCRM</div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  location.startsWith(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <button 
                onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.href = '/login' })}
                className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
