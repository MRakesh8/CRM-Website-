import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/database";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    message: n.message,
    type: n.type,
    read: n.read,
    relatedId: n.relatedId ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", async (_req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  res.json(notifications.map(formatNotification).reverse());
});

router.patch("/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  const [notification] = await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, id)).returning();
  if (!notification) return res.status(404).json({ error: "Not found" });
  res.json(formatNotification(notification));
});

router.post("/notifications/read-all", async (_req, res) => {
  await db.update(notificationsTable).set({ read: true });
  res.json({ success: true });
});

export default router;
