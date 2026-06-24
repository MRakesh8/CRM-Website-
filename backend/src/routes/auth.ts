import { Router, type IRouter } from "express";
import { db, usersTable, rolesTable, rolePermissionsTable, permissionsTable } from "@workspace/database";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../middleware/rbac";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "crm_super_secret_key_2024";

function hashPassword(password: string): string {
  // Use bcrypt if it's new, but support simpleHash for backwards compatibility or override it.
  // We'll just use simpleHash to match what we seeded since seed.ts used simpleHash.
  // Wait, the seed script is using simpleHash, I should use that here for compatibility if we want.
  // Actually, I'll update auth.ts to support simpleHash so the seeded admin works.
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

function verifyPassword(password: string, hash: string): boolean {
  if (hash.startsWith("crm_salt_2024:")) {
    return hash === hashPassword(password);
  }
  return bcrypt.compareSync(password, hash);
}

async function formatUser(u: any) {
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, u.roleId));
  
  const rolePerms = await db.select({
    key: permissionsTable.permissionKey
  })
  .from(rolePermissionsTable)
  .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
  .where(eq(rolePermissionsTable.roleId, role.id));

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: role.name,
    roleId: role.id,
    isActive: u.isActive,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt.toISOString(),
    permissions: rolePerms.map(p => p.key)
  };
}

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "Account deactivated" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  const formattedUser = await formatUser(user);
  
  res.json({ user: formattedUser, token });
});

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password required" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const isSuperAdminEmail = email === (process.env.SUPER_ADMIN_EMAIL || "rakesh837m@gmail.com");
  
  let targetRole;
  if (isSuperAdminEmail) {
    [targetRole] = await db.select().from(rolesTable).where(eq(rolesTable.name, "Super Admin"));
  } else {
    // Default to Employee
    [targetRole] = await db.select().from(rolesTable).where(eq(rolesTable.name, "Employee"));
  }

  if (!targetRole) {
    return res.status(500).json({ error: "Roles not properly seeded" });
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    roleId: targetRole.id,
    isActive: true,
  }).returning();

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  const formattedUser = await formatUser(user);

  res.status(201).json({ user: formattedUser, token });
});

router.get("/auth/me", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  
  // Clean up user object to match frontend expectations
  const responseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleId: user.roleId,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
    permissions: user.permissions
  };

  res.json(responseUser);
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

export default router;
