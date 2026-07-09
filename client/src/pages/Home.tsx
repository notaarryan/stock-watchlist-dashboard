import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import SearchModel from "../components/SearchModal";

function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center gap-10 w-full">
      <div className="text-5xl font-bold">Stock Watchlist</div>
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
      <SearchModel />
    </div>
  );
}

export default Home;
