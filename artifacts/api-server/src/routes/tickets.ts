import { Router, type IRouter } from "express";
import { db, ticketsTable, clientsTable, usersTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

let ticketCounter = 100;

async function getNextTicketNumber(): Promise<string> {
  const all = await db.select({ num: ticketsTable.ticketNumber }).from(ticketsTable);
  const max = all.reduce((acc, r) => {
    const n = parseInt(r.num.replace("TKT-", ""));
    return isNaN(n) ? acc : Math.max(acc, n);
  }, ticketCounter);
  ticketCounter = max + 1;
  return `TKT-${String(ticketCounter).padStart(4, "0")}`;
}

async function formatTicket(t: typeof ticketsTable.$inferSelect) {
  let clientName: string | null = null;
  let assigneeName: string | null = null;
  if (t.clientId) {
    const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, t.clientId));
    clientName = c?.name ?? null;
  }
  if (t.assigneeId) {
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, t.assigneeId));
    assigneeName = u?.name ?? null;
  }
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    clientId: t.clientId ?? null,
    clientName,
    subject: t.subject,
    description: t.description ?? null,
    priority: t.priority,
    status: t.status,
    assigneeId: t.assigneeId ?? null,
    assigneeName,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/tickets", async (req, res) => {
  const { clientId, status, assigneeId } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (clientId) conditions.push(eq(ticketsTable.clientId, parseInt(clientId)));
  if (status) conditions.push(eq(ticketsTable.status, status));
  if (assigneeId) conditions.push(eq(ticketsTable.assigneeId, parseInt(assigneeId)));
  const tickets = conditions.length > 0
    ? await db.select().from(ticketsTable).where(and(...conditions)).orderBy(ticketsTable.createdAt)
    : await db.select().from(ticketsTable).orderBy(ticketsTable.createdAt);
  res.json(await Promise.all(tickets.map(formatTicket)));
});

router.post("/tickets", async (req, res) => {
  const { subject, priority, status, ...rest } = req.body;
  if (!subject || !priority || !status) return res.status(400).json({ error: "Required fields missing" });
  const ticketNumber = await getNextTicketNumber();
  const [ticket] = await db.insert(ticketsTable).values({
    ticketNumber, subject, priority, status,
    clientId: rest.clientId ?? null,
    description: rest.description ?? null,
    assigneeId: rest.assigneeId ?? null,
  }).returning();
  res.status(201).json(await formatTicket(ticket));
});

router.get("/tickets/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(await formatTicket(ticket));
});

router.patch("/tickets/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [ticket] = await db.update(ticketsTable).set(req.body).where(eq(ticketsTable.id, id)).returning();
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(await formatTicket(ticket));
});

router.delete("/tickets/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(ticketsTable).where(eq(ticketsTable.id, id));
  res.status(204).send();
});

export default router;
