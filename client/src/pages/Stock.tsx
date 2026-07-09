import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

interface StockOverviewType {
  Name: string;
  Symbol: string;
  Exchange: string;
  Currency: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  "52WeekHigh": string;
  "52WeekLow": string;
}

function Stock() {
  const params = useParams();
  const [stockData, setStockData] = useState<StockDataType | null>(null);
  const [stockOverview, setStockOverview] = useState<StockOverviewType | null>(
    null,
  );
  const [stockHistory, setStockHistory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockDataResponse = await fetch(
          `http://localhost:3000/stocks/${params.symbol}`,
        );
        const stockDataResult = await stockDataResponse.json();
        const stockOverviewResponse = await fetch(
          `http://localhost:3000/stocks/${params.symbol}/overview`,
        );
        const stockOverviewResult = await stockOverviewResponse.json();
        const stockHistoryResponse = await fetch(
          `http://localhost:3000/stocks/${params.symbol}/history`,
        );
        const stockHistoryResult = await stockHistoryResponse.json();
        console.log(stockOverviewResult);
        setStockData(stockDataResult);
        setStockOverview(stockOverviewResult);
        setStockHistory(stockHistoryResult);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [params.symbol]);

  return (
    <div className="flex flex-col gap-4 w-full px-16 py-8">
      {stockData && stockOverview && (
        <>
          <div className="text-gray-400 text-sm">
            {params.symbol} · {stockOverview?.Name}
          </div>
          <div className="text-5xl font-bold">${stockData.c}</div>
          <div className={stockData.d >= 0 ? "text-green-500" : "text-red-500"}>
            {stockData.d >= 0 ? "+" : "-"}
            {stockData.d} ({stockData.dp}%) today
          </div>
        </>
      )}
    </div>
  );
}

export default Stock;
