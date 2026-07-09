import type React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setUsername(username);
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
  };

  const loginHandle = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    login(result.user);
    setUsername("");
    setPassword("");
    navigate(from);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <form
        onSubmit={loginHandle}
        className="flex flex-col gap-6 p-10 rounded-2xl w-100 border border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <div>
          <p className="text-sm uppercase tracking-widest text-center">Login</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="username"
            className="text-sm uppercase tracking-widest"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-white/30 transition-colors w-full"
            onChange={(e) => handleUsernameInput(e)}
            value={username}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="password"
            className="text-sm uppercase tracking-widest"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg outline-none focus:border-white/30 transition-colors w-full"
            onChange={(e) => handlePasswordInput(e)}
            value={password}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <button
          type="submit"
          className="bg-white text-black py-3 rounded-lg font-medium tracking-tight hover:bg-gray-100 hover:cursor-pointer transition-colors"
        >
          Login
        </button>
        <div>
          <p>
            If you do not have an account{" "}
            <Link to="/register" className="underline text-gray-500">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
