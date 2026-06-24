import { relations } from "drizzle-orm";
import { rolesTable } from "./roles";
import { usersTable } from "./users";
import { permissionsTable } from "./permissions";
import { rolePermissionsTable } from "./role_permissions";
import { auditLogsTable } from "./audit_logs";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
  auditLogs: many(auditLogsTable),
}));

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
  rolePermissions: many(rolePermissionsTable),
}));

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  rolePermissions: many(rolePermissionsTable),
}));

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [rolePermissionsTable.roleId],
    references: [rolesTable.id],
  }),
  permission: one(permissionsTable, {
    fields: [rolePermissionsTable.permissionId],
    references: [permissionsTable.id],
  }),
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [auditLogsTable.userId],
    references: [usersTable.id],
  }),
}));
