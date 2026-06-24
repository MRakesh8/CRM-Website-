import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  permissionKey: text("permission_key").notNull().unique(),
  permissionName: text("permission_name").notNull(),
  module: text("module").notNull(),
  description: text("description"),
});

export const insertPermissionSchema = createInsertSchema(permissionsTable).omit({ id: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissionsTable.$inferSelect;
