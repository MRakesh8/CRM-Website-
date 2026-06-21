import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Leads from "@/pages/leads";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Tickets from "@/pages/tickets";
import Calendar from "@/pages/calendar";
import Team from "@/pages/team";
import Notifications from "@/pages/notifications";
import Login from "@/pages/login";
import Register from "@/pages/register";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/clients">
        <AppLayout><Clients /></AppLayout>
      </Route>
      <Route path="/clients/:id">
        <AppLayout><div className="p-8">Client Detail WIP</div></AppLayout>
      </Route>
      <Route path="/leads">
        <AppLayout><Leads /></AppLayout>
      </Route>
      <Route path="/projects">
        <AppLayout><Projects /></AppLayout>
      </Route>
      <Route path="/projects/:id">
        <AppLayout><div className="p-8">Project Detail WIP</div></AppLayout>
      </Route>
      <Route path="/tasks">
        <AppLayout><Tasks /></AppLayout>
      </Route>
      <Route path="/invoices">
        <AppLayout><Invoices /></AppLayout>
      </Route>
      <Route path="/invoices/:id">
        <AppLayout><div className="p-8">Invoice Detail WIP</div></AppLayout>
      </Route>
      <Route path="/payments">
        <AppLayout><Payments /></AppLayout>
      </Route>
      <Route path="/tickets">
        <AppLayout><Tickets /></AppLayout>
      </Route>
      <Route path="/tickets/:id">
        <AppLayout><div className="p-8">Ticket Detail WIP</div></AppLayout>
      </Route>
      <Route path="/calendar">
        <AppLayout><Calendar /></AppLayout>
      </Route>
      <Route path="/team">
        <AppLayout><Team /></AppLayout>
      </Route>
      <Route path="/notifications">
        <AppLayout><Notifications /></AppLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
