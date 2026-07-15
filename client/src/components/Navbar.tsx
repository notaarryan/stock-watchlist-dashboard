import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const loggedInLinks = (
    <>
      <NavLink to="/" onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/watchlist" onClick={() => setMenuOpen(false)}>
        Watchlist
      </NavLink>
      <NavLink to="/portfolio" onClick={() => setMenuOpen(false)}>
        Portfolio
      </NavLink>
      <button className="hover:cursor-pointer text-left" onClick={handleLogout}>
        Log Out
      </button>
    </>
  );

  const loggedOutLinks = (
    <>
      <NavLink to="/" onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/register" onClick={() => setMenuOpen(false)}>
        Register
      </NavLink>
      <NavLink to="/login" onClick={() => setMenuOpen(false)}>
        Login
      </NavLink>
    </>
  );

  const links = user ? loggedInLinks : loggedOutLinks;

  return (
    <nav className="w-full">
      <div className="flex justify-between items-center w-full">
        <span>Stock Watchlist</span>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-8">{links}</div>
          <button
            onClick={toggleTheme}
            className="hover:cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="sm:hidden hover:cursor-pointer"
            title="Toggle menu"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-4 mt-4">{links}</div>
      )}
    </nav>
  );
}

export default Navbar;
