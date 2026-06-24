import { db } from "./index.js";
import { usersTable } from "./schema/users.js";
import { rolesTable } from "./schema/roles.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function simpleHash(password: string) {
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

async function run() {
  try {
    // 1. Get roles
    const roles = await db.select().from(rolesTable);
    const superAdminRole = roles.find(r => r.name === "Super Admin");
    const adminRole = roles.find(r => r.name === "Admin");

    if (!superAdminRole || !adminRole) {
      throw new Error("Roles not found");
    }

    // 2. Delete existing users
    await db.delete(usersTable).where(eq(usersTable.email, "rakesh837m@gmail.com"));
    await db.delete(usersTable).where(eq(usersTable.email, "admin@crm.com"));

    // 3. Insert real admin
    await db.insert(usersTable).values({
      name: "System Super Admin",
      email: "rakesh837m@gmail.com",
      passwordHash: simpleHash("rakesh9787"),
      roleId: superAdminRole.id,
      isActive: true,
    });

    // 4. Insert demo admin
    await db.insert(usersTable).values({
      name: "Demo Admin",
      email: "admin@crm.com",
      passwordHash: simpleHash("demo1234"),
      roleId: adminRole.id,
      isActive: true,
    });

    console.log("Updated users successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
