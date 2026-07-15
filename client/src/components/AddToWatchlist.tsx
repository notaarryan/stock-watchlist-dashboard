import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { logError } from "../utils/log";

function AddToWatchlist({ symbol }: { symbol: string }) {
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const { logout } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleClick = async () => {
    try {
      if (isAdded) {
        await fetch(`${BACKEND_URL}/watchlist/${symbol}`, {
          credentials: "include",
          method: "delete",
        });
        setIsAdded(false);
      } else {
        await fetch(`${BACKEND_URL}/watchlist`, {
          credentials: "include",
          method: "post",
          body: JSON.stringify({ stockSymbol: symbol }),
          headers: { "Content-Type": "application/json" },
        });
        setIsAdded(true);
      }
    } catch (error) {
      logError(`Failed to update watchlist for ${symbol}:`, error);
    }
  };

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/watchlist`, {
          credentials: "include",
        });
        if (response.status === 401) {
          logout();
          return;
        }
        const result = await response.json();
        const found =
          Array.isArray(result) &&
          result.some(
            (item: { stock_symbol: string }) => item.stock_symbol === symbol,
          );
        setIsAdded(found);
      } catch (error) {
        logError(`Failed to check watchlist status for ${symbol}:`, error);
      }
    };
    checkWatchlist();
  }, [symbol, BACKEND_URL, logout]);

  return (
    <button onClick={handleClick} className="cursor-pointer">
      {isAdded ? <FaStar size={20} /> : <FiStar size={20} />}
    </button>
  );
}

export default AddToWatchlist;
