import { db } from "./index.js";
import { usersTable } from "./schema/users.js";
import { rolesTable } from "./schema/roles.js";
import { eq } from "drizzle-orm";

function simpleHash(password: string): string {
  const salt = "crm_salt_2024";
  return `${salt}:${Buffer.from(password + salt).toString("base64")}`;
}

async function run() {
  try {
    const roles = await db.select().from(rolesTable).where(eq(rolesTable.name, "Super Admin"));
    if (roles.length === 0) {
      console.error("Super Admin role not found");
      process.exit(1);
    }
    const superAdminRole = roles[0];

    const email = "admin@crm.com";
    const passwordHash = simpleHash("password123");

    // Check if exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
    if (existing.length > 0) {
      console.log("Updating existing admin@crm.com user");
      await db.update(usersTable)
        .set({ roleId: superAdminRole.id, passwordHash, isActive: true })
        .where(eq(usersTable.email, email));
    } else {
      console.log("Creating admin@crm.com user");
      await db.insert(usersTable).values({
        name: "Admin User",
        email: email,
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      });
    }

    console.log("Success! You can now log in with admin@crm.com / password123");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
