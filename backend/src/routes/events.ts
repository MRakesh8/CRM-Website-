import { Router, type IRouter } from "express";
import { db, eventsTable } from "@workspace/database";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatEvent(e: typeof eventsTable.$inferSelect) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? null,
    startDate: e.startDate,
    endDate: e.endDate ?? null,
    type: e.type,
    relatedId: e.relatedId ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/events", async (_req, res) => {
  const events = await db.select().from(eventsTable).orderBy(eventsTable.startDate);
  res.json(events.map(formatEvent));
});

router.post("/events", async (req, res) => {
  const { title, startDate, type, ...rest } = req.body;
  if (!title || !startDate || !type) return res.status(400).json({ error: "Required fields missing" });
  const [event] = await db.insert(eventsTable).values({ title, startDate, type, ...rest }).returning();
  res.status(201).json(formatEvent(event));
});

router.patch("/events/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [event] = await db.update(eventsTable).set(req.body).where(eq(eventsTable.id, id)).returning();
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json(formatEvent(event));
});

router.delete("/events/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(eventsTable).where(eq(eventsTable.id, id));
  res.status(204).send();
});

export default router;
