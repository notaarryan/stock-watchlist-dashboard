import express from "express";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
import "./passport";
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
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
