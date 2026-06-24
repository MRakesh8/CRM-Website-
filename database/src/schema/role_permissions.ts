import { pgTable, primaryKey, integer } from "drizzle-orm/pg-core";
import { rolesTable } from "./roles";
import { permissionsTable } from "./permissions";

export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissionsTable.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  };
});
