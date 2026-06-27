import express from "express";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
import "./passport";
import authRouter from "./routes/auth";
import watchlistRouter from "./routes/watchlist";
import stocksRouter from "./routes/stocks";

const app = express();
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const port = Number(process.env.PORT) || 3000;
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", authRouter);
app.use("/watchlist", watchlistRouter);
app.use("/stocks", stocksRouter);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
