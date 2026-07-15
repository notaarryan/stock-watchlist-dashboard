import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function WatchlistItem({
  symbol,
  onRemove,
}: {
  symbol: string;
  onRemove: () => void;
}) {
  const [stockData, setStockData] = useState<StockDataType | null>(null);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/stocks/${symbol}`);
  };
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/stocks/${symbol}`);
        const result = await response.json();
        setStockData(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [symbol, BACKEND_URL]);
  return (
    <div
      className="flex justify-between items-center px-4 py-4 border border-black/10 dark:border-white/10 rounded-xl mb-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
      onClick={handleClick}
    >
      <div>
        <p className="font-bold">{symbol}</p>
        {stockData && (
          <p
            className={
              stockData.d >= 0
                ? "text-green-500 text-sm"
                : "text-red-500 text-sm"
            }
          >
            {stockData.d >= 0 ? "+" : ""}
            {stockData.d} ({stockData.dp}%)
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {stockData && <p className="font-medium">${stockData.c}</p>}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-500 hover:text-red-500 text-sm cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default WatchlistItem;
