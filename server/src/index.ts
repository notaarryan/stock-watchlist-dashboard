import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import cors from "cors";
import "./passport";
import pool from "./db/pool";
import authRouter from "./routes/auth";
import watchlistRouter from "./routes/watchlist";
import stocksRouter from "./routes/stocks";
import portfolioRouter from "./routes/portfolio";

const isProduction = process.env.NODE_ENV === "production";
const PgSession = connectPgSimple(session);

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const port = Number(process.env.PORT) || 3000;
app.get("/", (_req, res) => res.send("Hello World!"));
app.use("/auth", authRouter);
app.use("/watchlist", watchlistRouter);
app.use("/stocks", stocksRouter);
app.use("/portfolio", portfolioRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  },
);

app.listen(port);
