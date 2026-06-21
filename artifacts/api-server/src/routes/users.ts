import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function simpleHash(password: string): string {
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    avatarUrl: u.avatarUrl ?? null,
    projectsCount: null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

router.post("/users", async (req, res) => {
  const { name, email, password, role, avatarUrl } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Required fields missing" });
  }
  const [user] = await db.insert(usersTable).values({
    name, email,
    passwordHash: simpleHash(password),
    role,
    status: "active",
    avatarUrl: avatarUrl ?? null,
  }).returning();
  res.status(201).json(formatUser(user));
});

router.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(formatUser(user));
});

router.patch("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, role, status, avatarUrl } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (status !== undefined) updates.status = status;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(formatUser(user));
});

router.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
