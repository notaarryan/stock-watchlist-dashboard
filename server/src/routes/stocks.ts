import express from "express";

const stocksRouter = express.Router();

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

export default stocksRouter;
