import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";

function AddToWatchlist({ symbol }: { symbol: string }) {
  const [isAdded, setIsAdded] = useState<boolean>(false);
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
      console.log(error);
    }
  };

  useEffect(() => {
    const checkWatchlist = async () => {
      const response = await fetch(`${BACKEND_URL}/watchlist`, {
        credentials: "include",
      });
      const result = await response.json();
      const found = result.some(
        (item: { stock_symbol: string }) => item.stock_symbol === symbol,
      );
      setIsAdded(found);
    };
    checkWatchlist();
  }, [symbol, BACKEND_URL]);

  return (
    <button onClick={handleClick} className="cursor-pointer">
      {isAdded ? <FaStar size={20} /> : <FiStar size={20} />}
    </button>
  );
}

export default AddToWatchlist;
