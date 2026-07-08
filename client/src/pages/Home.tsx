import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center gap-10 w-full">
      <div className="text-5xl font-bold">Stock Watchlist</div>
      <div>
        <input
          className="border-[0.5px] rounded-2xl placeholder-white text-lg px-5 py-1 outline-none"
          type="text"
          name="search-bar"
          id="search-bar"
          placeholder="Search for stocks"
        />
      </div>
      <div>
        {!user && (
          <p>
            <Link to="/login" className="underline">
              Login
            </Link>{" "}
            to save stocks
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
