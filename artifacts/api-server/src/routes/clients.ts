import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

function formatClient(c: typeof clientsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    companyName: c.companyName ?? null,
    email: c.email,
    phone: c.phone ?? null,
    address: c.address ?? null,
    gstNumber: c.gstNumber ?? null,
    website: c.website ?? null,
    industry: c.industry ?? null,
    status: c.status,
    notes: c.notes ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/clients", async (req, res) => {
  const { search, status } = req.query as { search?: string; status?: string };
  const conditions: SQL[] = [];
  if (search) conditions.push(ilike(clientsTable.name, `%${search}%`));
  if (status) conditions.push(eq(clientsTable.status, status));
  const clients = conditions.length > 0
    ? await db.select().from(clientsTable).where(and(...conditions)).orderBy(clientsTable.createdAt)
    : await db.select().from(clientsTable).orderBy(clientsTable.createdAt);
  res.json(clients.map(formatClient));
});

router.post("/clients", async (req, res) => {
  const { name, email, status, ...rest } = req.body;
  if (!name || !email || !status) return res.status(400).json({ error: "Required fields missing" });
  const [client] = await db.insert(clientsTable).values({ name, email, status, ...rest }).returning();
  res.status(201).json(formatClient(client));
});

router.get("/clients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json(formatClient(client));
});

router.patch("/clients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [client] = await db.update(clientsTable).set(req.body).where(eq(clientsTable.id, id)).returning();
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json(formatClient(client));
});

router.delete("/clients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(clientsTable).where(eq(clientsTable.id, id));
  res.status(204).send();
});

export default router;
