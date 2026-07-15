import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pool from "./pool";

async function migrate() {
  const migrationsDirectory = resolve(__dirname, "../../sql");
  const migrations = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const migration of migrations) {
    const sql = await readFile(
      resolve(migrationsDirectory, migration),
      "utf8",
    );
    await pool.query(sql);
    console.log(`Applied ${migration}`);
  }

  await pool.end();
}

migrate().catch(async (error) => {
  console.error("Database migration failed", error);
  await pool.end();
  process.exit(1);
});
