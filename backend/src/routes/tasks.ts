import { validate } from "../middleware/validate.js";
import { CreateTaskBody, UpdateTaskBody } from "@workspace/api-zod";
import { Router, type IRouter } from "express";
import { db, tasksTable, projectsTable, usersTable } from "@workspace/database";
import { eq, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

async function formatTask(t: typeof tasksTable.$inferSelect) {
  let projectName: string | null = null;
  let assigneeName: string | null = null;
  if (t.projectId) {
    const [p] = await db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, t.projectId));
    projectName = p?.name ?? null;
  }
  if (t.assigneeId) {
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, t.assigneeId));
    assigneeName = u?.name ?? null;
  }
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    projectId: t.projectId ?? null,
    projectName,
    assigneeId: t.assigneeId ?? null,
    assigneeName,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ?? null,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/tasks", async (req, res) => {
  const { projectId, assigneeId, status } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (projectId) conditions.push(eq(tasksTable.projectId, parseInt(projectId)));
  if (assigneeId) conditions.push(eq(tasksTable.assigneeId, parseInt(assigneeId)));
  if (status) conditions.push(eq(tasksTable.status, status));
  const tasks = conditions.length > 0
    ? await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.createdAt)
    : await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  res.json(await Promise.all(tasks.map(formatTask)));
});

router.post("/tasks", validate(CreateTaskBody), async (req, res) => {
  const { title, status, priority, ...rest } = req.body;
  if (!title || !status || !priority) return res.status(400).json({ error: "Required fields missing" });
  const [task] = await db.insert(tasksTable).values({ title, status, priority, ...rest }).returning();
  res.status(201).json(await formatTask(task));
});

router.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(await formatTask(task));
});

router.patch("/tasks/:id", validate(UpdateTaskBody), async (req, res) => {
  const id = parseInt(req.params.id);
  const [task] = await db.update(tasksTable).set(req.body).where(eq(tasksTable.id, id)).returning();
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(await formatTask(task));
});

router.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.status(204).send();
});

export default router;
