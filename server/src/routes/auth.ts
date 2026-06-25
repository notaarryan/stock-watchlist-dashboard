import express from "express";
import passport from "passport";
import pool from "../db/pool";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", async (req, res, next) => {
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

export default router;
