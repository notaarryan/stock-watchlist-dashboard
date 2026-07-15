CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_watchlist (
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  PRIMARY KEY (user_id, stock_symbol)
);
