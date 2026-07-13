import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tooltip, Line, LineChart, XAxis, YAxis } from "recharts";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockDataResponse = await fetch(
          `http://localhost:3000/stocks/${params.symbol}`,
        );
        const stockDataResult = await stockDataResponse.json();
        setStockData(stockDataResult);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [params.symbol]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockHistoryResponse = await fetch(
          `http://localhost:3000/stocks/${params.symbol?.toUpperCase()}/history?range=${range}`,
        );
        const stockHistoryResult = await stockHistoryResponse.json();
        setStockHistory(stockHistoryResult);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [params.symbol, range]);

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

  return (
    <div className="flex flex-col gap-4 w-full px-16 py-8">
      {stockData && stockHistory && (
        <>
          <div className="text-gray-400 text-sm">
            {params.symbol} · {stockHistory.meta.longName}
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
          <div className="outline-none">
            <LineChart
              width={800}
              height={400}
              data={chartData}
              responsive
              className="outline-none"
            >
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={stockData.d >= 0 ? "#22c55e" : "#fb2c36"}
                dot={false}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                contentStyle={{
                  backgroundColor: "#111",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
            </LineChart>
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
