import { Router, type IRouter } from "express";
import { db, leadsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function formatLead(l: typeof leadsTable.$inferSelect) {
  let assigneeName: string | null = null;
  if (l.assigneeId) {
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, l.assigneeId));
    assigneeName = u?.name ?? null;
  }
  return {
    id: l.id,
    name: l.name,
    companyName: l.companyName ?? null,
    email: l.email,
    phone: l.phone ?? null,
    stage: l.stage,
    notes: l.notes ?? null,
    followUpDate: l.followUpDate ?? null,
    assigneeId: l.assigneeId ?? null,
    assigneeName,
    value: l.value ? parseFloat(l.value) : null,
    createdAt: l.createdAt.toISOString(),
  };
}

router.get("/leads", async (_req, res) => {
  const leads = await db.select().from(leadsTable).orderBy(leadsTable.createdAt);
  res.json(await Promise.all(leads.map(formatLead)));
});

router.post("/leads", async (req, res) => {
  const { name, email, stage, ...rest } = req.body;
  if (!name || !email || !stage) return res.status(400).json({ error: "Required fields missing" });
  const [lead] = await db.insert(leadsTable).values({
    name, email, stage,
    value: rest.value?.toString(),
    assigneeId: rest.assigneeId ?? null,
    ...Object.fromEntries(Object.entries(rest).filter(([k]) => !['value','assigneeId'].includes(k)))
  }).returning();
  res.status(201).json(await formatLead(lead));
});

router.get("/leads/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!lead) return res.status(404).json({ error: "Not found" });
  res.json(await formatLead(lead));
});

router.patch("/leads/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates: Record<string, unknown> = { ...req.body };
  if (updates.value !== undefined) updates.value = updates.value?.toString();
  const [lead] = await db.update(leadsTable).set(updates).where(eq(leadsTable.id, id)).returning();
  if (!lead) return res.status(404).json({ error: "Not found" });
  res.json(await formatLead(lead));
});

router.delete("/leads/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(leadsTable).where(eq(leadsTable.id, id));
  res.status(204).send();
});

export default router;
