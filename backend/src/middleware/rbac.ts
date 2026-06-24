import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/database";
import { usersTable, rolesTable, rolePermissionsTable, permissionsTable, auditLogsTable } from "@workspace/database/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "crm_super_secret_key_2024";

// Extract and verify JWT
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
    
    if (!user || !user.isActive) return res.status(401).json({ error: "Unauthorized" });

    // Fetch user role and permissions
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, user.roleId!));
    
    const rolePermissions = await db.select({
      key: permissionsTable.permissionKey
    })
    .from(rolePermissionsTable)
    .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
    .where(eq(rolePermissionsTable.roleId, role.id));

    const permissions = rolePermissions.map(p => p.key);

    (req as any).user = {
      ...user,
      role: role.name,
      permissions
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Check for specific permission
export function requirePermission(permissionKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    if (user.role === "Super Admin") {
      return next(); // Super Admin can do anything
    }

    if (!user.permissions.includes(permissionKey)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
}

// Audit logging helper
export async function logAudit(req: Request, action: string, module: string, details?: any) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return;

    await db.insert(auditLogsTable).values({
      userId,
      action,
      module,
      details,
      ipAddress: req.ip || req.socket.remoteAddress,
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}
