import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-accent">404</p>

      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>

      <p className="mt-2 text-muted">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-accent px-6 py-3 font-semibold text-black hover:bg-accent-dark"
      >
        Back to products
      </Link>
    </div>
  );
}