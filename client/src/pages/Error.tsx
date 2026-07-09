import { useRouteError } from "react-router-dom";

function Error() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="min-h-screen w-full flex flex-col px-10 py-2.5 text-gray-50 bg-gray-950 justify-center items-center">
      {String(error)}
    </div>
  );
}

export default Error;
