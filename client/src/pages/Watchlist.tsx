import { useEffect, useState } from "react";
import WatchlistItem from "../components/WatchlistItem";
import Loader from "./Loader";

interface WatchlistItemType {
  stock_symbol: string;
}

function Watchlist() {
  const [watchlistItems, setWatchlistItems] = useState<
    WatchlistItemType[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleRemove = async (symbol: string) => {
    try {
      await fetch(`${BACKEND_URL}/watchlist/${symbol}`, {
        credentials: "include",
        method: "delete",
      });
      setWatchlistItems(
        (prev) => prev?.filter((item) => item.stock_symbol !== symbol) ?? null,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove stock from watchlist",
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/watchlist`, {
          credentials: "include",
        });
        const result = await response.json();
        if (Array.isArray(result)) {
          setWatchlistItems(result);
        } else {
          setWatchlistItems([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load watchlist data",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [BACKEND_URL]);

  if (isLoading) return <Loader />;

  if (error)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (watchlistItems !== null && watchlistItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          Add stocks to watchlist to see them here
        </p>
      </div>
    );
  }

  return (
    <>
      {watchlistItems?.map((item) => (
        <div
          key={item.stock_symbol}
          className="flex flex-col max-w-2xl mx-auto w-full mt-8"
        >
          <WatchlistItem
            symbol={item.stock_symbol}
            onRemove={() => handleRemove(item.stock_symbol)}
          />
        </div>
      ))}
    </>
  );
}

export default Watchlist;
