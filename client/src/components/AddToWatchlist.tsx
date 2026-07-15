import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";

function AddToWatchlist({ symbol }: { symbol: string }) {
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const handleClick = async () => {
    try {
      if (isAdded) {
        await fetch(`http://localhost:3000/watchlist/${symbol}`, {
          credentials: "include",
          method: "delete",
        });
        setIsAdded(false);
      } else {
        await fetch(`http://localhost:3000/watchlist`, {
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
      const response = await fetch("http://localhost:3000/watchlist", {
        credentials: "include",
      });
      const result = await response.json();
      const found = result.some(
        (item: { stock_symbol: string }) => item.stock_symbol === symbol,
      );
      setIsAdded(found);
    };
    checkWatchlist();
  }, [symbol]);

  return (
    <button onClick={handleClick} className="cursor-pointer">
      {isAdded ? <FaStar size={20} /> : <FiStar size={20} />}
    </button>
  );
}

export default AddToWatchlist;
