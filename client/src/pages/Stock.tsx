import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import AddToWatchlist from "../components/AddToWatchlist";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

interface StockDataType {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface StockHistoryType {
  meta: {
    longName: string;
  };
  quotes: StockPriceDataType[];
}

interface StockPriceDataType {
  date: string;
  high: number;
  volume: number;
  open: number;
  low: number;
  close: number;
  adjclose: number;
}

function Stock() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const params = useParams();
  const [stockData, setStockData] = useState<StockDataType | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistoryType | null>(
    null,
  );
  const chartData = stockHistory?.quotes.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    price: item.close,
  }));
  const firstPrice = chartData?.[0]?.price;
  const lastPrice = chartData?.[chartData.length - 1]?.price;
  const rangeReturn =
    firstPrice && lastPrice
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : null;
  const [displayPrice, setDisplayPrice] = useState(0);
  const [range, setRange] = useState<"1W" | "1M" | "1Y" | "10Y">("1W");
  const rangeLabel: Record<string, string> = {
    "1W": "past week",
    "1M": "past month",
    "1Y": "past year",
    "10Y": "past 10 years",
  };
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockDataResponse = await fetch(
          `${BACKEND_URL}/${params.symbol}`,
        );
        const stockDataResult = await stockDataResponse.json();
        setStockData(stockDataResult);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load stock data",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [BACKEND_URL, params.symbol]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockHistoryResponse = await fetch(
          `${BACKEND_URL}/${params.symbol?.toUpperCase()}/history?range=${range}`,
        );
        const stockHistoryResult = await stockHistoryResponse.json();
        setStockHistory(stockHistoryResult);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load stock data",
        );
      }
    };
    fetchData();
  }, [params.symbol, range, BACKEND_URL]);

  useEffect(() => {
    if (!stockData) return;
    const target = stockData.c;
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayPrice(target);
        clearInterval(timer);
      } else {
        setDisplayPrice(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stockData]);

  if (isLoading) {
    return <Loader />;
  }

  if (error)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 w-full px-16 py-8">
      {stockData && stockHistory && (
        <>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>
              {params.symbol} · {stockHistory.meta.longName}
            </span>
            {user && <AddToWatchlist symbol={params.symbol!} />}
          </div>
          <div className="text-5xl font-bold">${displayPrice.toFixed(2)}</div>
          <div className={stockData.d >= 0 ? "text-green-500" : "text-red-500"}>
            <span
              className={
                rangeReturn && rangeReturn >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {rangeReturn?.toFixed(2)}% {rangeLabel[range]}
            </span>
            {" · "}
            <span
              className={stockData.d >= 0 ? "text-green-500" : "text-red-500"}
            >
              {stockData.d >= 0 ? "+" : ""}
              {stockData.d} ({stockData.dp}%) today
            </span>
          </div>
          <div className="max-w-full outline-none overflow-hidden">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} responsive className="outline-none">
                <XAxis dataKey="date" />
                <YAxis domain={["auto", "auto"]} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={
                    rangeReturn && rangeReturn >= 0 ? "#22c55e" : "#fb2c36"
                  }
                  dot={false}
                />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Price",
                  ]}
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2">
            {["1W", "1M", "1Y", "10Y"].map((r) => (
              <button
                key={r}
                className={
                  r === range
                    ? "bg-white text-black px-3 py-1 rounded-full text-sm cursor-pointer"
                    : "text-gray-400 px-3 py-1 rounded-full text-sm hover:text-white cursor-pointer"
                }
                onClick={() => setRange(r as "1W" | "1M" | "1Y" | "10Y")}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Stock;
