import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "./db/pool";

passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
      );
      const user = result.rows[0];
      if (!user) return done(null, false);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query(
      "SELECT user_id, username FROM users WHERE user_id = $1",
      [id],
    );
    const user = result.rows[0];
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
