CREATE TABLE IF NOT EXISTS portfolio_lots (
  lot_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  shares NUMERIC(20, 8) NOT NULL CHECK (shares > 0),
  purchase_price NUMERIC(20, 4) NOT NULL CHECK (purchase_price > 0),
  purchase_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_lots_user_id ON portfolio_lots (user_id);
