import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

async function main() {
  const relativeSqlPath = process.argv[2];
  if (!relativeSqlPath) {
    console.error("Usage: ts-node src/db/runSql.ts <path-to-sql>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), relativeSqlPath);
  const sql = fs.readFileSync(sqlPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(sql);
    console.log(`Executed SQL: ${relativeSqlPath}`);
  } catch (err) {
    console.error(`Failed executing SQL: ${relativeSqlPath}`);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
