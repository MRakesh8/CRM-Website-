import { Router, type IRouter } from "express";
import { db, usersTable, rolesTable, rolePermissionsTable, permissionsTable } from "@workspace/database";
import { eq, not, and, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticateToken, requirePermission, logAudit } from "../middleware/rbac";

const router: IRouter = Router();

async function formatUser(u: any) {
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, u.roleId));
  
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: role.name,
    roleId: role.id,
    isActive: u.isActive,
    avatarUrl: u.avatarUrl ?? null,
    projectsCount: null,
    createdAt: u.createdAt.toISOString(),
  };
}

// Get Super Admin role ID to filter them out
async function getSuperAdminRoleId() {
  const [saRole] = await db.select().from(rolesTable).where(eq(rolesTable.name, "Super Admin"));
  return saRole?.id;
}

// List Users
router.get("/users", authenticateToken, requirePermission("view_users"), async (req, res) => {
  const userRole = (req as any).user.role;
  let usersQuery = db.select().from(usersTable);

  if (userRole !== "Super Admin") {
    const saRoleId = await getSuperAdminRoleId();
    if (saRoleId) {
      usersQuery = usersQuery.where(not(eq(usersTable.roleId, saRoleId)));
    }
  }

  const users = await usersQuery.orderBy(usersTable.createdAt);
  
  const formattedUsers = await Promise.all(users.map(u => formatUser(u)));
  res.json(formattedUsers);
});

// Create User
router.post("/users", authenticateToken, requirePermission("create_users"), async (req, res) => {
  const { name, email, password, roleId, avatarUrl } = req.body;
  if (!name || !email || !password || !roleId) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const userRole = (req as any).user.role;
  const saRoleId = await getSuperAdminRoleId();

  if (roleId === saRoleId && userRole !== "Super Admin") {
    return res.status(403).json({ error: "Only Super Admins can create Super Admin accounts" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const [user] = await db.insert(usersTable).values({
    name, email,
    passwordHash: bcrypt.hashSync(password, 10),
    roleId,
    isActive: true,
    avatarUrl: avatarUrl ?? null,
  }).returning();
  
  await logAudit(req, "Create User", "User Management", { userId: user.id, email: user.email });
  res.status(201).json(await formatUser(user));
});

// Get User by ID
router.get("/users/:id", authenticateToken, requirePermission("view_users"), async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) return res.status(404).json({ error: "Not found" });

  const saRoleId = await getSuperAdminRoleId();
  if (user.roleId === saRoleId && (req as any).user.role !== "Super Admin") {
    return res.status(404).json({ error: "Not found" }); // Act like it doesn't exist
  }

  res.json(await formatUser(user));
});

// Update User
router.patch("/users/:id", authenticateToken, requirePermission("edit_users"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, roleId, isActive, avatarUrl } = req.body;
  
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existingUser) return res.status(404).json({ error: "Not found" });

  const currentUser = (req as any).user;
  const saRoleId = await getSuperAdminRoleId();

  // Super Admin Protection
  if (existingUser.roleId === saRoleId) {
    if (currentUser.role !== "Super Admin") {
      return res.status(404).json({ error: "Not found" }); // Pretend it doesn't exist
    }
  }

  // Prevent standard users from assigning Super Admin role
  if (roleId === saRoleId && currentUser.role !== "Super Admin") {
    return res.status(403).json({ error: "Cannot assign Super Admin role" });
  }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (roleId !== undefined) updates.roleId = roleId;
  if (isActive !== undefined) updates.isActive = isActive;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  
  updates.updatedAt = new Date();

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  
  await logAudit(req, "Update User", "User Management", { userId: user.id, updates });
  res.json(await formatUser(user));
});

// Delete User
router.delete("/users/:id", authenticateToken, requirePermission("delete_users"), async (req, res) => {
  const id = parseInt(req.params.id);
  
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existingUser) return res.status(404).json({ error: "Not found" });

  const saRoleId = await getSuperAdminRoleId();
  if (existingUser.roleId === saRoleId) {
    if ((req as any).user.role !== "Super Admin") {
      return res.status(404).json({ error: "Not found" }); // Prevent finding
    }
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  await logAudit(req, "Delete User", "User Management", { userId: id, email: existingUser.email });
  
  res.status(204).send();
});

export default router;
