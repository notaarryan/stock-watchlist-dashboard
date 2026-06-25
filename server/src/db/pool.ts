import "dotenv/config";
import { Pool } from "pg";
const pool = new Pool({
  port: Number(process.env.POSTGRESS_PORT) || 5432,
  user: process.env.POSTGRESS_USERNAME!,
  database: process.env.POSTGRESS_DB!,
  password: process.env.POSTGRESS_PASSWORD!,
  host: process.env.POSTGRESS_HOST!,
});
export default pool;
