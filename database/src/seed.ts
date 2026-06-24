import { db } from "./index.js";
import { usersTable } from "./schema/users.js";
import { rolesTable } from "./schema/roles.js";
import { permissionsTable } from "./schema/permissions.js";
import { rolePermissionsTable } from "./schema/role_permissions.js";
import { auditLogsTable } from "./schema/audit_logs.js";
import { clientsTable } from "./schema/clients.js";
import { projectsTable } from "./schema/projects.js";
import { tasksTable } from "./schema/tasks.js";
import { leadsTable } from "./schema/leads.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function simpleHash(password: string): string {
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

const ALL_PERMISSIONS = [
  // User Management
  { key: "manage_users", name: "Manage Users", module: "User Management", desc: "Full access to user management" },
  { key: "create_users", name: "Create User", module: "User Management", desc: "" },
  { key: "edit_users", name: "Edit User", module: "User Management", desc: "" },
  { key: "delete_users", name: "Delete User", module: "User Management", desc: "" },
  { key: "view_users", name: "View Users", module: "User Management", desc: "" },

  // Lead Management
  { key: "create_leads", name: "Create Lead", module: "Lead Management", desc: "" },
  { key: "edit_leads", name: "Edit Lead", module: "Lead Management", desc: "" },
  { key: "delete_leads", name: "Delete Lead", module: "Lead Management", desc: "" },
  { key: "view_all_leads", name: "View All Leads", module: "Lead Management", desc: "" },
  { key: "view_own_leads", name: "View Own Leads", module: "Lead Management", desc: "" },

  // Task Management
  { key: "create_tasks", name: "Create Task", module: "Task Management", desc: "" },
  { key: "edit_tasks", name: "Edit Task", module: "Task Management", desc: "" },
  { key: "delete_tasks", name: "Delete Task", module: "Task Management", desc: "" },
  { key: "view_tasks", name: "View Tasks", module: "Task Management", desc: "" },

  // Settings & System
  { key: "manage_roles", name: "Manage Roles", module: "System Settings", desc: "" },
  { key: "manage_permissions", name: "Manage Permissions", module: "System Settings", desc: "" },
  { key: "export_data", name: "Export Data", module: "System Settings", desc: "" },
  { key: "import_data", name: "Import Data", module: "System Settings", desc: "" },
];

async function run() {
  try {
    console.log("Wiping existing data...");
    await db.delete(auditLogsTable);
    await db.delete(rolePermissionsTable);
    await db.delete(permissionsTable);
    await db.delete(tasksTable);
    await db.delete(projectsTable);
    await db.delete(clientsTable);
    await db.delete(leadsTable);
    await db.delete(usersTable);
    await db.delete(rolesTable);

    console.log("Seeding RBAC system...");

    // 1. Insert Roles
    const roles = await db.insert(rolesTable).values([
      { name: "Super Admin", description: "Ultimate system administrator", isSystem: true },
      { name: "Admin", description: "System administrator", isSystem: true },
      { name: "Manager", description: "Team or departmental manager", isSystem: true },
      { name: "Employee", description: "Standard employee", isSystem: true },
    ]).returning();

    const superAdminRole = roles.find(r => r.name === "Super Admin")!;
    const adminRole = roles.find(r => r.name === "Admin")!;
    const managerRole = roles.find(r => r.name === "Manager")!;
    const employeeRole = roles.find(r => r.name === "Employee")!;

    // 2. Insert Permissions
    const permissions = await db.insert(permissionsTable).values(
      ALL_PERMISSIONS.map(p => ({
        permissionKey: p.key,
        permissionName: p.name,
        module: p.module,
        description: p.desc,
      }))
    ).returning();

    // 3. Map Permissions to Roles
    const rolePermissions = [];
    
    for (const p of permissions) {
      // Super Admin gets everything
      rolePermissions.push({ roleId: superAdminRole.id, permissionId: p.id });

      // Admin gets almost everything except manage roles/permissions
      if (!["manage_roles", "manage_permissions"].includes(p.permissionKey)) {
        rolePermissions.push({ roleId: adminRole.id, permissionId: p.id });
      }

      // Manager gets leads and tasks and viewing users
      if (["view_users", "create_leads", "edit_leads", "view_all_leads", "create_tasks", "edit_tasks", "view_tasks"].includes(p.permissionKey)) {
        rolePermissions.push({ roleId: managerRole.id, permissionId: p.id });
      }

      // Employee gets own leads and viewing tasks
      if (["view_own_leads", "edit_leads", "view_tasks", "edit_tasks"].includes(p.permissionKey)) {
        rolePermissions.push({ roleId: employeeRole.id, permissionId: p.id });
      }
    }

    await db.insert(rolePermissionsTable).values(rolePermissions);

    // 4. Create Super Admin User
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "rakesh837m@gmail.com";
    await db.insert(usersTable).values({
      name: "System Super Admin",
      email: superAdminEmail,
      passwordHash: simpleHash("rakesh9787"),
      roleId: superAdminRole.id,
      isActive: true,
    });
    console.log(`Created Super Admin: ${superAdminEmail}`);

    console.log("✅ RBAC Seeding complete!");
  } catch (error) {
    console.error("❌ Failed to seed database:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

run();
