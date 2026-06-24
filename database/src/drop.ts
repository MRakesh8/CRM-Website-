import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { db } from "./index.js";
import { sql } from "drizzle-orm";

async function dropAll() {
  try {
    console.log("Dropping all tables...");
    await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    console.log("Done. Ready for push.");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
dropAll();
