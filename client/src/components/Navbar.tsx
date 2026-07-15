import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    logout();
    navigate("/");
  };
  if (user) {
    return (
      <nav className="flex justify-between items-center w-full">
        <span>Stock Watchlist</span>
        <div className="flex gap-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/watchlist">Watchlist</NavLink>
          <button className="hover:cursor-pointer" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>
    );
  }
  return (
    <nav className="flex justify-between items-center w-full">
      <span>Stock Watchlist</span>
      <div className="flex gap-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/register">Register</NavLink>
        <NavLink to="/login">Login</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
