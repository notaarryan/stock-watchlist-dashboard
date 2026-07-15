import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

function Error() {
  const error = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-gray-950 px-10 py-2.5 text-gray-50">
      <h1 className="text-4xl font-bold">
        {isNotFound ? "404 — Page not found" : "Something went wrong"}
      </h1>

      <p className="text-gray-400">
        {isNotFound
          ? "The page you requested does not exist."
          : "An unexpected error occurred."}
      </p>

      <Link to="/" className="underline text-gray-500 hover:text-gray-300">
        Go back home
      </Link>
    </div>
  );
}

export default Error;
