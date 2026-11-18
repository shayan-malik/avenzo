import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <p className="text-gradient relative text-[7rem] font-extrabold leading-none sm:text-[10rem]">
        404
      </p>

      <div className="glass animate-fade-up relative mt-4 w-full rounded-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Page not found</h1>

        <p className="mx-auto mt-3 max-w-md text-muted">
          The page you are looking for does not exist, or it may have been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-8 py-3"
          >
            <Home size={18} />
            Back to products
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold transition hover:border-accent/60 hover:text-accent"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}