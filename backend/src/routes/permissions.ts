import { Router, type IRouter } from "express";
import { db, permissionsTable } from "@workspace/database";
import { authenticateToken, requirePermission } from "../middleware/rbac";

const router: IRouter = Router();

// Get all permissions grouped by module
router.get("/permissions", authenticateToken, requirePermission("manage_roles"), async (req, res) => {
  try {
    const permissions = await db.select().from(permissionsTable);
    
    // Group by module
    const grouped = permissions.reduce((acc, curr) => {
      if (!acc[curr.module]) {
        acc[curr.module] = [];
      }
      acc[curr.module].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

export default router;
