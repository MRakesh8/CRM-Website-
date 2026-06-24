import { validate } from "../middleware/validate.js";
import { CreateInvoiceBody, UpdateInvoiceBody } from "@workspace/api-zod";
import { Router, type IRouter } from "express";
import { db, invoicesTable, clientsTable } from "@workspace/database";
import { eq, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

let invoiceCounter = 1000;

async function getNextInvoiceNumber(): Promise<string> {
  const all = await db.select({ num: invoicesTable.invoiceNumber }).from(invoicesTable);
  const max = all.reduce((acc, r) => {
    const n = parseInt(r.num.replace("INV-", ""));
    return isNaN(n) ? acc : Math.max(acc, n);
  }, invoiceCounter);
  invoiceCounter = max + 1;
  return `INV-${String(invoiceCounter).padStart(4, "0")}`;
}

async function formatInvoice(inv: typeof invoicesTable.$inferSelect) {
  let clientName: string | null = null;
  const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, inv.clientId));
  clientName = c?.name ?? null;
  const items = (inv.items as Array<{ description: string; quantity: number; unitPrice: number; amount: number }>) ?? [];
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientId: inv.clientId,
    clientName,
    items,
    subtotal: parseFloat(inv.subtotal),
    tax: parseFloat(inv.tax),
    discount: parseFloat(inv.discount),
    total: parseFloat(inv.total),
    status: inv.status,
    dueDate: inv.dueDate,
    notes: inv.notes ?? null,
    createdAt: inv.createdAt.toISOString(),
  };
}

router.get("/invoices", async (req, res) => {
  const { clientId, status } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (clientId) conditions.push(eq(invoicesTable.clientId, parseInt(clientId)));
  if (status) conditions.push(eq(invoicesTable.status, status));
  const invoices = conditions.length > 0
    ? await db.select().from(invoicesTable).where(and(...conditions)).orderBy(invoicesTable.createdAt)
    : await db.select().from(invoicesTable).orderBy(invoicesTable.createdAt);
  res.json(await Promise.all(invoices.map(formatInvoice)));
});

router.post("/invoices", validate(CreateInvoiceBody), async (req, res) => {
  const { clientId, items, dueDate, status, tax = 0, discount = 0, notes } = req.body;
  if (!clientId || !items || !dueDate || !status) return res.status(400).json({ error: "Required fields missing" });
  const subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
  const total = subtotal + parseFloat(String(tax)) - parseFloat(String(discount));
  const invoiceNumber = await getNextInvoiceNumber();
  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber,
    clientId,
    items,
    subtotal: subtotal.toString(),
    tax: tax.toString(),
    discount: discount.toString(),
    total: total.toString(),
    status,
    dueDate,
    notes: notes ?? null,
  }).returning();
  res.status(201).json(await formatInvoice(invoice));
});

router.get("/invoices/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(await formatInvoice(invoice));
});

router.patch("/invoices/:id", validate(UpdateInvoiceBody), async (req, res) => {
  const id = parseInt(req.params.id);
  const updates: Record<string, unknown> = { ...req.body };
  if (updates.items) {
    const items = updates.items as Array<{ amount: number }>;
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const tax = parseFloat(String(updates.tax ?? 0));
    const discount = parseFloat(String(updates.discount ?? 0));
    updates.subtotal = subtotal.toString();
    updates.total = (subtotal + tax - discount).toString();
    if (updates.tax !== undefined) updates.tax = updates.tax?.toString();
    if (updates.discount !== undefined) updates.discount = updates.discount?.toString();
  }
  const [invoice] = await db.update(invoicesTable).set(updates).where(eq(invoicesTable.id, id)).returning();
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(await formatInvoice(invoice));
});

router.delete("/invoices/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
  res.status(204).send();
});

export default router;
