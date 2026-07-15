import express from "express";
import pool from "../db/pool";
import { isAuth } from "../middleware/isAuth";

const watchlistRouter = express.Router();

watchlistRouter.get("/", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const result = await pool.query(
      "SELECT stock_symbol FROM stock_watchlist WHERE user_id = $1",
      [userId],
    );
    const watchlist = result.rows;
    if (watchlist.length === 0)
      return res.status(200).json({ message: "Empty watchlist" });
    return res.json(watchlist);
  } catch (error) {
    next(error);
  }
});

watchlistRouter.post("/", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const stockSymbol =
      typeof req.body.stockSymbol === "string"
        ? req.body.stockSymbol.trim().toUpperCase()
        : "";
    if (!stockSymbol) {
      return res.status(400).json({ message: "stockSymbol is required" });
    }
    await pool.query(
      "INSERT INTO stock_watchlist (user_id, stock_symbol) VALUES ($1, $2)",
      [userId, stockSymbol],
    );
    return res.status(201).json({ message: "Stock added to watchlist" });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return res.status(409).json({ message: "Stock already in watchlist" });
    }
    next(error);
  }
});

watchlistRouter.delete("/:symbol", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const stockSymbol = String(req.params.symbol).toUpperCase();
    await pool.query(
      "DELETE FROM stock_watchlist WHERE user_id = $1 AND stock_symbol = $2",
      [userId, stockSymbol],
    );
    return res
      .status(200)
      .json({ message: "Stock removed from the watchlist" });
  } catch (error) {
    next(error);
  }
});

export default watchlistRouter;
