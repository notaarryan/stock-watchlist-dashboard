export interface PortfolioLot {
  lot_id: number;
  stock_symbol: string;
  shares: number;
  purchase_price: number;
  purchase_date: string;
}

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
}

export interface SymbolAggregate {
  symbol: string;
  lots: PortfolioLot[];
  totalShares: number;
  totalCost: number;
  avgCost: number;
  marketValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
}

export function aggregateBySymbol(
  lots: PortfolioLot[],
  quotes: Record<string, StockQuote>,
): SymbolAggregate[] {
  const groups = new Map<string, PortfolioLot[]>();
  for (const lot of lots) {
    const existing = groups.get(lot.stock_symbol);
    if (existing) {
      existing.push(lot);
    } else {
      groups.set(lot.stock_symbol, [lot]);
    }
  }

  return Array.from(groups.entries()).map(([symbol, symbolLots]) => {
    const totalShares = symbolLots.reduce((sum, lot) => sum + lot.shares, 0);
    const totalCost = symbolLots.reduce(
      (sum, lot) => sum + lot.shares * lot.purchase_price,
      0,
    );
    const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
    const quote = quotes[symbol];
    const marketValue = quote ? totalShares * quote.c : null;
    const gainLoss = marketValue !== null ? marketValue - totalCost : null;
    const gainLossPct =
      gainLoss !== null && totalCost > 0 ? (gainLoss / totalCost) * 100 : null;

    return {
      symbol,
      lots: symbolLots,
      totalShares,
      totalCost,
      avgCost,
      marketValue,
      gainLoss,
      gainLossPct,
    };
  });
}

export interface PortfolioSummary {
  totalCost: number;
  totalMarketValue: number;
  gainLoss: number;
  gainLossPct: number;
  hasAllQuotes: boolean;
}

export function summarizePortfolio(
  aggregates: SymbolAggregate[],
): PortfolioSummary {
  const totalCost = aggregates.reduce((sum, a) => sum + a.totalCost, 0);
  const hasAllQuotes = aggregates.every((a) => a.marketValue !== null);
  const totalMarketValue = aggregates.reduce(
    (sum, a) => sum + (a.marketValue ?? 0),
    0,
  );
  const gainLoss = totalMarketValue - totalCost;
  const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  return { totalCost, totalMarketValue, gainLoss, gainLossPct, hasAllQuotes };
}
