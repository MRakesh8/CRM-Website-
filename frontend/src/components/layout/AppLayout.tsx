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
  Target,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useListNotifications } from "@workspace/api-client-react";
import { CurrencySelector } from "@/components/ui/currency-selector";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const { data: notifications } = useListNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/leads", label: "Leads", icon: Target },
    { href: "/projects", label: "Projects", icon: Briefcase },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/tickets", label: "Tickets", icon: Ticket },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/team", label: "Team", icon: Users },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    ...(user?.role === 'Super Admin' || user?.permissions?.includes('manage_roles') 
      ? [{ href: "/settings/roles", label: "Roles & Permissions", icon: Shield }] 
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="font-bold text-2xl tracking-tight text-sidebar-primary">NexusCRM</div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold truncate">{user.name}</span>
                  <span className="text-xs text-sidebar-foreground/60 capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </div>
              <button 
                onClick={() => logout()}
                className="text-xs text-left text-sidebar-foreground/70 hover:text-destructive transition-colors mt-1 font-medium"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-end px-8 border-b bg-background/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <CurrencySelector />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
