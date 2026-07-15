import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SymbolAggregate } from "../utils/portfolio";

function PortfolioSymbolGroup({
  aggregate,
  onRemoveLot,
}: {
  aggregate: SymbolAggregate;
  onRemoveLot: (lotId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { symbol, lots, totalShares, avgCost, marketValue, gainLoss, gainLossPct } =
    aggregate;
  const isPositive = (gainLoss ?? 0) >= 0;

  return (
    <div className="border border-black/10 dark:border-white/10 rounded-xl mb-2 overflow-hidden">
      <div
        className="flex justify-between items-center px-4 py-4 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div>
          <p
            className="font-bold hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stocks/${symbol}`);
            }}
          >
            {symbol}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {totalShares} shares · avg ${avgCost.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {marketValue !== null ? `$${marketValue.toFixed(2)}` : "—"}
          </p>
          {gainLoss !== null && gainLossPct !== null && (
            <p
              className={
                isPositive
                  ? "text-green-500 text-sm"
                  : "text-red-500 text-sm"
              }
            >
              {isPositive ? "+" : ""}
              {gainLoss.toFixed(2)} ({gainLossPct.toFixed(2)}%)
            </p>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-black/10 dark:border-white/10">
          {lots.map((lot) => (
            <div
              key={lot.lot_id}
              className="flex justify-between items-center px-4 py-3 border-b border-black/10 dark:border-white/10 last:border-none gap-4"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {lot.shares} shares @ ${lot.purchase_price.toFixed(2)} on{" "}
                {lot.purchase_date}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLot(lot.lot_id);
                }}
                className="text-gray-500 hover:text-red-500 text-sm cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioSymbolGroup;
