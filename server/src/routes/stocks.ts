import express from "express";
import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();

const stocksRouter = express.Router();

stocksRouter.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "");
    const response = await fetch(
      `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&apiKey=${process.env.POLYGON_API_KEY}`,
    );
    const result = await response.json();
    return res.json({ stockData: result });
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol;
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${process.env.FINNHUB_API_KEY}`,
    );
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:symbol/history", async (req, res, next) => {
  try {
    const range = req.query.range || "1W";
    const symbol = req.params.symbol;
    const period1 = new Date();
    let interval: "1d" | "1wk" | "1mo" = "1d";

    if (range === "1W") {
      period1.setDate(period1.getDate() - 7);
      interval = "1d";
    } else if (range === "1M") {
      period1.setMonth(period1.getMonth() - 1);
      interval = "1d";
    } else if (range === "1Y") {
      period1.setFullYear(period1.getFullYear() - 1);
      interval = "1wk";
    } else if (range === "10Y") {
      period1.setFullYear(period1.getFullYear() - 10);
      interval = "1mo";
    }

    const result = await yf.chart(
      symbol,
      { period1, interval },
      { validateResult: false },
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:symbol/overview", async (req, res, next) => {
  try {
    const symbol = req.params.symbol;
    const response = await fetch(
      `https://api.polygon.io/v3/reference/tickers/${encodeURIComponent(symbol)}?apiKey=${process.env.POLYGON_API_KEY}`,
    );
    const result = await response.json();
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

export default stocksRouter;
