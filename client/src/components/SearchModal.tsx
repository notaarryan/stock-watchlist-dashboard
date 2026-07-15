import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface StockMatch {
  ticker: string;
  name: string;
  market: string;
}

interface StockDataType {
  stockData: {
    results: StockMatch[];
  };
}

function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockData, setStockData] = useState<StockDataType | null>(null);
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const shortcut = isMac ? "⌘K" : "Ctrl+K";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (
        (isMac && e.metaKey && e.key === "k") ||
        (!isMac && e.ctrlKey && e.key === "k")
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMac]);

  const fetchStocks = async () => {
    const response = await fetch(
      `${BACKEND_URL}/stocks/search?q=${searchQuery}`,
    );
    const result = await response.json();
    setStockData(result);
    setSearchQuery("");
  };

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    fetchStocks();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchStocks();
  };

  const inputHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <FiSearch /> Search{" "}
        <span className="text-gray-500 text-sm">{shortcut}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <input
              className="border-[0.5px] rounded-2xl placeholder-white text-lg px-5 py-1 outline-none pr-12"
              type="text"
              name="search-bar"
              id="search-bar"
              placeholder="Search for stocks"
              value={searchQuery}
              onChange={(e) => inputHandle(e)}
              onKeyDown={(e) => handleKeyDown(e)}
              autoFocus
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
              onClick={(e) => {
                handleSearch(e);
              }}
            >
              <FiSearch size={18} />
            </button>
            {stockData && (
              <div className="absolute top-full left-0 w-full bg-gray-900 rounded-xl mt-1 z-10 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {stockData.stockData.results.map((stock) => (
                  <div
                    key={stock["ticker"]}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/stocks/${stock["ticker"]}`);
                    }}
                    className="flex justify-between items-center px-4 py-3 border-b border-white/10 hover:bg-white/10 cursor-pointer last:border-none gap-4"
                  >
                    <div>
                      <span className="font-bold">{stock["ticker"]}</span>
                      <span className="text-gray-400 ml-2">
                        {stock["name"]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                      {stock["market"]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SearchModal;
