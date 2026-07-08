import express from "express";
import passport from "passport";
import pool from "../db/pool";
import bcrypt from "bcrypt";

interface user {
  user_id: number;
  username: string;
}

const authRouter = express.Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];
    if (user) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    res.status(201).json({ message: "User created" });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ user: req.user, message: "Logged in" });
});

authRouter.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
});

authRouter.get("/me", (req, res, next) => {
  if (req.isAuthenticated() === true) {
    return res.json({ user: req.user });
  }
  return res.status(401).json({ message: "Not logged in" });
});

export default authRouter;
