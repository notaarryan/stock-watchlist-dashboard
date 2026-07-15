import pool from "./pool";

async function reset() {
  await pool.query(
    "DROP TABLE IF EXISTS portfolio_lots, stock_watchlist, session, users CASCADE",
  );
  console.log("Dropped existing tables");
  await pool.end();
}

reset().catch(async (error) => {
  console.error("Database reset failed", error);
  await pool.end();
  process.exit(1);
});