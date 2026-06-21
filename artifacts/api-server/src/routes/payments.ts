import { Router, type IRouter } from "express";
import { db, paymentsTable, clientsTable, invoicesTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

async function formatPayment(p: typeof paymentsTable.$inferSelect) {
  let clientName: string | null = null;
  let invoiceNumber: string | null = null;
  if (p.clientId) {
    const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, p.clientId));
    clientName = c?.name ?? null;
  }
  if (p.invoiceId) {
    const [inv] = await db.select({ num: invoicesTable.invoiceNumber }).from(invoicesTable).where(eq(invoicesTable.id, p.invoiceId));
    invoiceNumber = inv?.num ?? null;
  }
  return {
    id: p.id,
    invoiceId: p.invoiceId ?? null,
    invoiceNumber,
    clientId: p.clientId ?? null,
    clientName,
    amount: parseFloat(p.amount),
    method: p.method,
    status: p.status,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payments", async (req, res) => {
  const { clientId, status } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (clientId) conditions.push(eq(paymentsTable.clientId, parseInt(clientId)));
  if (status) conditions.push(eq(paymentsTable.status, status));
  const payments = conditions.length > 0
    ? await db.select().from(paymentsTable).where(and(...conditions)).orderBy(paymentsTable.createdAt)
    : await db.select().from(paymentsTable).orderBy(paymentsTable.createdAt);
  res.json(await Promise.all(payments.map(formatPayment)));
});

router.post("/payments", async (req, res) => {
  const { amount, method, status, ...rest } = req.body;
  if (!amount || !method || !status) return res.status(400).json({ error: "Required fields missing" });
  const [payment] = await db.insert(paymentsTable).values({
    amount: amount.toString(), method, status,
    invoiceId: rest.invoiceId ?? null,
    clientId: rest.clientId ?? null,
    notes: rest.notes ?? null,
  }).returning();
  res.status(201).json(await formatPayment(payment));
});

router.get("/payments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!payment) return res.status(404).json({ error: "Not found" });
  res.json(await formatPayment(payment));
});

router.patch("/payments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates: Record<string, unknown> = { ...req.body };
  if (updates.amount !== undefined) updates.amount = updates.amount?.toString();
  const [payment] = await db.update(paymentsTable).set(updates).where(eq(paymentsTable.id, id)).returning();
  if (!payment) return res.status(404).json({ error: "Not found" });
  res.json(await formatPayment(payment));
});

export default router;
