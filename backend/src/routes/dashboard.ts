import { Router, type IRouter } from "express";
import { db, clientsTable, leadsTable, projectsTable, paymentsTable, ticketsTable, notificationsTable, tasksTable, invoicesTable } from "@workspace/database";
import { eq, and, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res) => {
  const [clients, leads, projects, openTickets, payments] = await Promise.all([
    db.select().from(clientsTable),
    db.select().from(leadsTable),
    db.select().from(projectsTable),
    db.select().from(ticketsTable).where(eq(ticketsTable.status, "open")),
    db.select().from(paymentsTable).where(eq(paymentsTable.status, "paid")),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyPayments = payments.filter(p => p.createdAt >= new Date(monthStart));
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const pendingInvoices = await db.select().from(invoicesTable).where(eq(invoicesTable.status, "sent"));
  const pendingPayments = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  res.json({
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "active").length,
    totalLeads: leads.length,
    totalProjects: projects.length,
    monthlyRevenue,
    pendingPayments,
    openTickets: openTickets.length,
    completedProjects: projects.filter(p => p.status === "completed").length,
    wonLeads: leads.filter(l => l.stage === "won").length,
  });
});

router.get("/dashboard/revenue-chart", async (_req, res) => {
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.status, "paid"));
  const invoices = await db.select().from(invoicesTable);

  const months: Record<string, { revenue: number; payments: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    months[key] = { revenue: 0, payments: 0 };
  }

  for (const inv of invoices) {
    const d = new Date(inv.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (months[key]) months[key].revenue += parseFloat(inv.total);
  }

  for (const p of payments) {
    const d = new Date(p.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (months[key]) months[key].payments += parseFloat(p.amount);
  }

  res.json(Object.entries(months).map(([month, v]) => ({ month, ...v })));
});

router.get("/dashboard/activity", async (_req, res) => {
  const [clients, leads, projects, tickets, invoices] = await Promise.all([
    db.select().from(clientsTable).orderBy(sql`${clientsTable.createdAt} desc`).limit(3),
    db.select().from(leadsTable).orderBy(sql`${leadsTable.createdAt} desc`).limit(3),
    db.select().from(projectsTable).orderBy(sql`${projectsTable.createdAt} desc`).limit(3),
    db.select().from(ticketsTable).orderBy(sql`${ticketsTable.createdAt} desc`).limit(3),
    db.select().from(invoicesTable).orderBy(sql`${invoicesTable.createdAt} desc`).limit(3),
  ]);

  const activities = [
    ...clients.map(c => ({ id: c.id, message: `New client ${c.name} added`, type: "client", entityName: c.name, createdAt: c.createdAt.toISOString() })),
    ...leads.map(l => ({ id: l.id + 1000, message: `Lead ${l.name} created`, type: "lead", entityName: l.name, createdAt: l.createdAt.toISOString() })),
    ...projects.map(p => ({ id: p.id + 2000, message: `Project "${p.name}" started`, type: "project", entityName: p.name, createdAt: p.createdAt.toISOString() })),
    ...tickets.map(t => ({ id: t.id + 3000, message: `Ticket opened: ${t.subject}`, type: "ticket", entityName: t.subject, createdAt: t.createdAt.toISOString() })),
    ...invoices.map(i => ({ id: i.id + 4000, message: `Invoice ${i.invoiceNumber} created`, type: "invoice", entityName: i.invoiceNumber, createdAt: i.createdAt.toISOString() })),
  ];

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(activities.slice(0, 10));
});

router.get("/dashboard/pipeline", async (_req, res) => {
  const leads = await db.select().from(leadsTable);
  const stages = ["new", "contacted", "interested", "proposal_sent", "negotiation", "won", "lost"];
  const pipeline = stages.map(stage => ({
    stage,
    count: leads.filter(l => l.stage === stage).length,
    value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (l.value ? parseFloat(l.value) : 0), 0),
  }));
  res.json(pipeline);
});

export default router;
