import express from "express";

const stocksRouter = express.Router();

stocksRouter.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    );
    const result = await response.json();
    res.json({ stockData: result });
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:symbol", async (req, res, next) => {
  try {
    const symbol = req.params.symbol;
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
    );
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    next(error);
  }
});

stocksRouter.get("/:symbol/history", async (req, res, next) => {
  try {
    const range = req.query.range || "1D";
    const symbol = req.params.symbol;
    const functionMap: Record<string, string> = {
      "1W": "TIME_SERIES_DAILY",
      "1M": "TIME_SERIES_DAILY",
      "1Y": "TIME_SERIES_WEEKLY",
      "10Y": "TIME_SERIES_MONTHLY",
    };

    const avFunction = functionMap[range as string] || "TIME_SERIES_DAILY";
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${avFunction}&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    );
    const result = await response.json();
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

export default stocksRouter;
