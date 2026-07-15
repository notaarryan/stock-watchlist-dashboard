import { config } from "dotenv";
import { Pool } from "pg";

config({ quiet: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});
export default pool;
