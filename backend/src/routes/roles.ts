import { Router, type IRouter } from "express";
import { db, rolesTable, rolePermissionsTable, permissionsTable } from "@workspace/database";
import { eq, inArray } from "drizzle-orm";
import { authenticateToken, requirePermission, logAudit } from "../middleware/rbac";

const router: IRouter = Router();

// Get all roles
router.get("/roles", authenticateToken, requirePermission("manage_roles"), async (req, res) => {
  try {
    const roles = await db.select().from(rolesTable);
    
    // Get permissions for all roles
    const allRolePerms = await db.select({
      roleId: rolePermissionsTable.roleId,
      permissionKey: permissionsTable.permissionKey
    })
    .from(rolePermissionsTable)
    .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id));

    const rolesWithPerms = roles.map(role => {
      const perms = allRolePerms.filter(rp => rp.roleId === role.id).map(rp => rp.permissionKey);
      return { ...role, permissions: perms };
    });

    res.json(rolesWithPerms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// Create role
router.post("/roles", authenticateToken, requirePermission("manage_roles"), async (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name) return res.status(400).json({ error: "Role name is required" });

  try {
    const [newRole] = await db.insert(rolesTable).values({
      name,
      description,
      isSystem: false
    }).returning();

    // Assign permissions
    if (permissions && permissions.length > 0) {
      const perms = await db.select().from(permissionsTable).where(inArray(permissionsTable.permissionKey, permissions));
      if (perms.length > 0) {
        const rpValues = perms.map(p => ({ roleId: newRole.id, permissionId: p.id }));
        await db.insert(rolePermissionsTable).values(rpValues);
      }
    }

    await logAudit(req, "Create Role", "System Settings", { role: name, permissions });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: "Failed to create role" });
  }
});

// Update role
router.put("/roles/:id", authenticateToken, requirePermission("manage_roles"), async (req, res) => {
  const { name, description, permissions } = req.body;
  const roleId = parseInt(req.params.id);

  try {
    const [existingRole] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId));
    if (!existingRole) return res.status(404).json({ error: "Role not found" });

    // Ensure they don't rename system roles
    const isSuperAdmin = (req as any).user.role === "Super Admin";
    if (existingRole.isSystem && !isSuperAdmin) {
      return res.status(403).json({ error: "Only Super Admin can modify system roles" });
    }

    const [updatedRole] = await db.update(rolesTable).set({
      name: existingRole.isSystem ? existingRole.name : name, // prevent renaming system roles
      description
    }).where(eq(rolesTable.id, roleId)).returning();

    // Update permissions
    if (permissions !== undefined) {
      // Delete old permissions
      await db.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));
      
      // Insert new permissions
      if (permissions.length > 0) {
        const perms = await db.select().from(permissionsTable).where(inArray(permissionsTable.permissionKey, permissions));
        if (perms.length > 0) {
          const rpValues = perms.map(p => ({ roleId, permissionId: p.id }));
          await db.insert(rolePermissionsTable).values(rpValues);
        }
      }
    }

    await logAudit(req, "Update Role", "System Settings", { role: existingRole.name, newPermissions: permissions });
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Delete role
router.delete("/roles/:id", authenticateToken, requirePermission("manage_roles"), async (req, res) => {
  const roleId = parseInt(req.params.id);

  try {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId));
    if (!role) return res.status(404).json({ error: "Role not found" });

    if (role.isSystem) {
      return res.status(403).json({ error: "System roles cannot be deleted" });
    }

    await db.delete(rolesTable).where(eq(rolesTable.id, roleId));
    await logAudit(req, "Delete Role", "System Settings", { role: role.name });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
});

export default router;
