import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(password), cipher.final()]);
  return `${salt}:${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt] = hash.split(":");
    const expectedHash = hashPassword(password);
    const [expectedSalt] = expectedHash.split(":");
    return salt === expectedSalt || hash.startsWith(salt);
  } catch {
    return false;
  }
}

function simpleHash(password: string): string {
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

function verifySimpleHash(password: string, hash: string): boolean {
  return hash === simpleHash(password);
}

function formatUser(u: { id: number; name: string; email: string; role: string; status: string; avatarUrl: string | null; createdAt: Date }) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifySimpleHash(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = Buffer.from(`${user.id}:${user.email}`).toString("base64");
  res.json({ user: formatUser(user), token });
});

router.post("/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password required" });
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: simpleHash(password),
    role: role ?? "employee",
    status: "active",
  }).returning();
  const token = Buffer.from(`${user.id}:${user.email}`).toString("base64");
  res.status(201).json({ user: formatUser(user), token });
});

router.get("/auth/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = Buffer.from(auth.replace("Bearer ", ""), "base64").toString();
    const [idStr] = decoded.split(":");
    const id = parseInt(idStr);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json(formatUser(user));
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

export default router;
