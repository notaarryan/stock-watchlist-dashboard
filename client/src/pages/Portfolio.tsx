import { useEffect, useState } from "react";
import PortfolioSymbolGroup from "../components/PortfolioSymbolGroup";
import Loader from "./Loader";
import {
  aggregateBySymbol,
  summarizePortfolio,
  type PortfolioLot,
  type StockQuote,
} from "../utils/portfolio";

function Portfolio() {
  const [lots, setLots] = useState<PortfolioLot[] | null>(null);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/portfolio`, {
          credentials: "include",
        });
        const result = await response.json();
        const rawLots = Array.isArray(result.lots) ? result.lots : [];
        setLots(
          rawLots.map((lot: PortfolioLot) => ({
            ...lot,
            shares: Number(lot.shares),
            purchase_price: Number(lot.purchase_price),
          })),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load portfolio",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchLots();
  }, [BACKEND_URL]);

  useEffect(() => {
    if (!lots || lots.length === 0) return;
    const distinctSymbols = Array.from(
      new Set(lots.map((lot) => lot.stock_symbol)),
    );
    const fetchQuotes = async () => {
      const entries = await Promise.all(
        distinctSymbols.map(async (symbol) => {
          try {
            const response = await fetch(`${BACKEND_URL}/stocks/${symbol}`);
            const quote = await response.json();
            return [symbol, quote] as const;
          } catch {
            return null;
          }
        }),
      );
      setQuotes((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          if (entry) next[entry[0]] = entry[1];
        }
        return next;
      });
    };
    fetchQuotes();
  }, [lots, BACKEND_URL]);

  const handleRemoveLot = async (lotId: number) => {
    try {
      await fetch(`${BACKEND_URL}/portfolio/${lotId}`, {
        credentials: "include",
        method: "delete",
      });
      setLots((prev) => prev?.filter((lot) => lot.lot_id !== lotId) ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove holding",
      );
    }
  };

  if (isLoading) return <Loader />;

  if (error)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (lots === null || lots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-500">
          Add shares from a stock's page to start tracking your portfolio
        </p>
      </div>
    );
  }

  const aggregates = aggregateBySymbol(lots, quotes);
  const summary = summarizePortfolio(aggregates);
  const isPositive = summary.gainLoss >= 0;

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full mt-8 gap-6">
      <div className="border border-black/10 dark:border-white/10 rounded-xl px-6 py-5">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Portfolio value
        </p>
        <p className="text-3xl font-bold">
          {summary.hasAllQuotes
            ? `$${summary.totalMarketValue.toFixed(2)}`
            : "—"}
        </p>
        {summary.hasAllQuotes && (
          <p className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {summary.gainLoss.toFixed(2)} ({summary.gainLossPct.toFixed(2)}%)
            · cost basis ${summary.totalCost.toFixed(2)}
          </p>
        )}
      </div>
      <div>
        {aggregates.map((aggregate) => (
          <PortfolioSymbolGroup
            key={aggregate.symbol}
            aggregate={aggregate}
            onRemoveLot={handleRemoveLot}
          />
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
