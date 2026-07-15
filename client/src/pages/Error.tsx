import { useRouteError } from "react-router-dom";

function Error() {
  const error = useRouteError() as { message?: string };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-gray-400">
        {error?.message || "An unexpected error occurred"}
      </p>
    </div>
  );
}

export default Error;
