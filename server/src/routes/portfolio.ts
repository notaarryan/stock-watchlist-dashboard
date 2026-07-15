import express from "express";
import pool from "../db/pool";
import { isAuth } from "../middleware/isAuth";

const portfolioRouter = express.Router();

portfolioRouter.get("/", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const result = await pool.query(
      "SELECT lot_id, stock_symbol, shares, purchase_price, purchase_date FROM portfolio_lots WHERE user_id = $1 ORDER BY stock_symbol, purchase_date",
      [userId],
    );
    return res.json({ lots: result.rows });
  } catch (error) {
    next(error);
  }
});

portfolioRouter.post("/", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const stockSymbol =
      typeof req.body.stockSymbol === "string"
        ? req.body.stockSymbol.trim().toUpperCase()
        : "";
    const shares = Number(req.body.shares);
    const purchasePrice = Number(req.body.purchasePrice);
    const purchaseDate = req.body.purchaseDate;

    if (!stockSymbol) {
      return res.status(400).json({ message: "stockSymbol is required" });
    }
    if (!Number.isFinite(shares) || shares <= 0) {
      return res
        .status(400)
        .json({ message: "shares must be a positive number" });
    }
    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return res
        .status(400)
        .json({ message: "purchasePrice must be a positive number" });
    }
    if (
      typeof purchaseDate !== "string" ||
      Number.isNaN(Date.parse(purchaseDate)) ||
      new Date(purchaseDate) > new Date()
    ) {
      return res
        .status(400)
        .json({ message: "purchaseDate must be a valid date not in the future" });
    }

    const result = await pool.query(
      `INSERT INTO portfolio_lots (user_id, stock_symbol, shares, purchase_price, purchase_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING lot_id, stock_symbol, shares, purchase_price, purchase_date`,
      [userId, stockSymbol, shares, purchasePrice, purchaseDate],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

portfolioRouter.delete("/:lotId", isAuth, async (req, res, next) => {
  try {
    const userId = req.user!.user_id;
    const lotId = Number(req.params.lotId);
    if (!Number.isInteger(lotId)) {
      return res.status(400).json({ message: "Invalid lot id" });
    }
    const result = await pool.query(
      "DELETE FROM portfolio_lots WHERE lot_id = $1 AND user_id = $2",
      [lotId, userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Lot not found" });
    }
    return res.status(200).json({ message: "Lot removed" });
  } catch (error) {
    next(error);
  }
});

export default portfolioRouter;
