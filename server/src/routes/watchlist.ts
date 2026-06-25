import express from "express";
import pool from "../db/pool";
import { isAuth } from "../middleware/isAuth";

const watchlistRouter = express.Router();

watchlistRouter.get("/watchlist", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const result = await pool.query(
      "SELECT stock_symbol FROM stock_watchlist WHERE user_id = $1",
      [userId],
    );
    const watchlist = result.rows;
    if (watchlist.length === 0)
      return res.status(201).json({ message: "Empty watchlist" });
    return res.json(watchlist);
  } catch (error) {
    next(error);
  }
});

export default watchlistRouter;
