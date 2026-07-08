import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Watchlist from "../pages/Watchlist";
import Stock from "../pages/Stock";
import Error from "../pages/Error";
import Loader from "../pages/Loader";
import RootLaylout from "../layouts/RootLaylout";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLaylout />,
    errorElement: <Error />,
    HydrateFallback: Loader,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "watchlist",
        element: (
          <ProtectedRoute>
            <Watchlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "stocks/:symbol",
        element: (
          <ProtectedRoute>
            <Stock />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
