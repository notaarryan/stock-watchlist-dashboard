import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";

function AddToPortfolio({
  symbol,
  currentPrice,
}: {
  symbol: string;
  currentPrice?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(
    currentPrice ? String(currentPrice) : "",
  );
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleOpen = () => {
    setPurchasePrice(currentPrice ? String(currentPrice) : "");
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/portfolio`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockSymbol: symbol,
          shares: Number(shares),
          purchasePrice: Number(purchasePrice),
          purchaseDate,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Failed to add to portfolio");
        return;
      }
      setIsOpen(false);
      setShares("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add to portfolio",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="cursor-pointer"
        title="Add to portfolio"
      >
        <FiPlusCircle size={20} />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 bg-black/5 dark:bg-white/5"
    >
      <input
        type="number"
        step="any"
        min="0"
        required
        placeholder="Shares"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        className="w-20 bg-transparent outline-none border-b border-black/20 dark:border-white/20"
      />
      <input
        type="number"
        step="any"
        min="0"
        required
        placeholder="Price"
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(e.target.value)}
        className="w-24 bg-transparent outline-none border-b border-black/20 dark:border-white/20"
      />
      <input
        type="date"
        required
        value={purchaseDate}
        onChange={(e) => setPurchaseDate(e.target.value)}
        className="bg-transparent outline-none border-b border-black/20 dark:border-white/20"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-sm cursor-pointer"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-gray-500 text-sm cursor-pointer"
      >
        Cancel
      </button>
      {error && <p className="text-red-500 text-sm w-full">{error}</p>}
    </form>
  );
}

export default AddToPortfolio;
