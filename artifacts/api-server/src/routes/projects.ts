import { Router, type IRouter } from "express";
import { db, projectsTable, clientsTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

async function formatProject(p: typeof projectsTable.$inferSelect) {
  let clientName: string | null = null;
  if (p.clientId) {
    const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, p.clientId));
    clientName = c?.name ?? null;
  }
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    clientId: p.clientId ?? null,
    clientName,
    budget: p.budget ? parseFloat(p.budget) : null,
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    status: p.status,
    progress: p.progress,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/projects", async (req, res) => {
  const { clientId, status } = req.query as { clientId?: string; status?: string };
  const conditions: SQL[] = [];
  if (clientId) conditions.push(eq(projectsTable.clientId, parseInt(clientId)));
  if (status) conditions.push(eq(projectsTable.status, status));
  const projects = conditions.length > 0
    ? await db.select().from(projectsTable).where(and(...conditions)).orderBy(projectsTable.createdAt)
    : await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(await Promise.all(projects.map(formatProject)));
});

router.post("/projects", async (req, res) => {
  const { name, status, ...rest } = req.body;
  if (!name || !status) return res.status(400).json({ error: "Required fields missing" });
  const [project] = await db.insert(projectsTable).values({
    name, status,
    budget: rest.budget?.toString(),
    progress: rest.progress ?? 0,
    ...Object.fromEntries(Object.entries(rest).filter(([k]) => !['budget','progress'].includes(k)))
  }).returning();
  res.status(201).json(await formatProject(project));
});

router.get("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(await formatProject(project));
});

router.patch("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates: Record<string, unknown> = { ...req.body };
  if (updates.budget !== undefined) updates.budget = updates.budget?.toString();
  const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(await formatProject(project));
});

router.delete("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

export default router;
