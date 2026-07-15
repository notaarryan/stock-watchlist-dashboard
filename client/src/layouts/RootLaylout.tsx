import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import Loader from "../pages/Loader";

function RootLaylout() {
  const { loading } = useAuth();
  if (loading) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen w-full flex flex-col px-10 py-2.5 text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLaylout;
