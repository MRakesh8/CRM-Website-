import { useGetDashboardStats, useGetRevenueChart, useGetRecentActivity, useGetLeadPipeline } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, FileText, CheckSquare, Activity, DollarSign, Target, MessageSquare } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChart();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivity();
  const { data: pipelineData, isLoading: pipelineLoading } = useGetLeadPipeline();
  const { formatCurrency } = useCurrency();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to NexusCRM. Here's what's happening.</p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />) : (
          <>
            <Link href="/clients" className="block group">
              <Card className="border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Clients</CardTitle>
                  <div className="bg-blue-100 p-2 rounded-md dark:bg-blue-900/30"><Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.totalClients || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{stats?.activeClients || 0} active</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/leads" className="block group">
              <Card className="border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lead Pipeline</CardTitle>
                  <div className="bg-indigo-100 p-2 rounded-md dark:bg-indigo-900/30"><Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.totalLeads || 0}</div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{stats?.wonLeads || 0} won deals</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/projects" className="block group">
              <Card className="border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Projects</CardTitle>
                  <div className="bg-amber-100 p-2 rounded-md dark:bg-amber-900/30"><Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{stats?.totalProjects || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{stats?.completedProjects || 0} completed</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/invoices" className="block group">
              <Card className="border-border shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Monthly Revenue</CardTitle>
                  <div className="bg-emerald-100 p-2 rounded-md dark:bg-emerald-900/30"><DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium">{stats?.pendingPayments || 0} pending payments</p>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {revenueLoading ? <Skeleton className="w-full h-full" /> : revenueData && revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed rounded-lg">No revenue data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Lead Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px]">
                {pipelineLoading ? <Skeleton className="w-full h-full" /> : pipelineData && pipelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.replace('_', ' ').split(' ').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ')} dy={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        formatter={(value: number) => [value, 'Leads']}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed rounded-lg">No pipeline data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed Column */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {activityLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/3" /></div></div>
                  ))}
                </div>
              ) : activityData && activityData.length > 0 ? (
                <div className="divide-y divide-border">
                  {activityData.slice(0, 10).map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors flex gap-4 items-start">
                      <div className={cn("p-2 rounded-full shrink-0", getActivityColor(activity.message))}>
                        {getActivityIcon(activity.message)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-snug">{activity.message}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground font-medium">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
      <CardContent><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-20" /></CardContent>
    </Card>
  );
}

function getActivityIcon(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("client")) return <Users className="w-4 h-4" />;
  if (msg.includes("lead") || msg.includes("deal")) return <Target className="w-4 h-4" />;
  if (msg.includes("project")) return <Briefcase className="w-4 h-4" />;
  if (msg.includes("task")) return <CheckSquare className="w-4 h-4" />;
  if (msg.includes("invoice") || msg.includes("payment")) return <DollarSign className="w-4 h-4" />;
  if (msg.includes("ticket") || msg.includes("support")) return <MessageSquare className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
}

function getActivityColor(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("client")) return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  if (msg.includes("lead") || msg.includes("deal")) return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
  if (msg.includes("project")) return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
  if (msg.includes("task")) return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (msg.includes("invoice") || msg.includes("payment")) return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (msg.includes("ticket") || msg.includes("support")) return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}
