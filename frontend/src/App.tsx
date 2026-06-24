import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import Leads from "@/pages/leads";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Tasks from "@/pages/tasks";
import Invoices from "@/pages/invoices";
import InvoiceDetail from "@/pages/invoice-detail";
import Payments from "@/pages/payments";
import Tickets from "@/pages/tickets";
import TicketDetail from "@/pages/ticket-detail";
import Calendar from "@/pages/calendar";
import Team from "@/pages/team";
import Notifications from "@/pages/notifications";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import RolesPage from "@/pages/settings/roles";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  if (!isAuthenticated) return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login"><PublicRoute><Login /></PublicRoute></Route>
      <Route path="/register"><PublicRoute><Register /></PublicRoute></Route>
      <Route path="/"><Redirect to="/dashboard" /></Route>
      <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/clients"><ProtectedRoute><Clients /></ProtectedRoute></Route>
      <Route path="/clients/:id"><ProtectedRoute><ClientDetail /></ProtectedRoute></Route>
      <Route path="/leads"><ProtectedRoute><Leads /></ProtectedRoute></Route>
      <Route path="/projects"><ProtectedRoute><Projects /></ProtectedRoute></Route>
      <Route path="/projects/:id"><ProtectedRoute><ProjectDetail /></ProtectedRoute></Route>
      <Route path="/tasks"><ProtectedRoute><Tasks /></ProtectedRoute></Route>
      <Route path="/invoices"><ProtectedRoute><Invoices /></ProtectedRoute></Route>
      <Route path="/invoices/:id"><ProtectedRoute><InvoiceDetail /></ProtectedRoute></Route>
      <Route path="/payments"><ProtectedRoute><Payments /></ProtectedRoute></Route>
      <Route path="/tickets"><ProtectedRoute><Tickets /></ProtectedRoute></Route>
      <Route path="/tickets/:id"><ProtectedRoute><TicketDetail /></ProtectedRoute></Route>
      <Route path="/calendar"><ProtectedRoute><Calendar /></ProtectedRoute></Route>
      <Route path="/team"><ProtectedRoute><Team /></ProtectedRoute></Route>
      <Route path="/notifications"><ProtectedRoute><Notifications /></ProtectedRoute></Route>
      <Route path="/settings/roles"><ProtectedRoute><RolesPage /></ProtectedRoute></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <AuthProvider>
            <CurrencyProvider>
              <Router />
            </CurrencyProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
