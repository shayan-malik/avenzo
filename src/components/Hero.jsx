import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import { formatPrice } from "../utils/formatPrice.js";

const scrollToCatalog = () => {
  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
};

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: products = [], isPending } = useQuery({
    queryKey: ["products", "home-feed"],
    queryFn: async () => {
      const res = await api.get("/products", {
        params: { limit: 50, sort: "newest" },
      });
      return res.data.products;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const slides = products.filter((p) => p.image_url && p.stock > 0).slice(0, 5);

  const tiles = categories
    .map((category) => ({
      ...category,
      image: products.find((p) => p.category_id === category.id && p.image_url)
        ?.image_url,
    }))
    .filter((tile) => tile.image)
    .slice(0, 4);

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const go = (step) => {
    setIndex((i) => (i + step + slides.length) % slides.length);
  };

  if (isPending) {
    return <div className="skeleton mb-12 h-[26rem] rounded-3xl" />;
  }

  const current = slides.length > 0 ? slides[index % slides.length] : null;

  return (
    <div className="mb-12 space-y-10">
      {current ? (
        <section
          className="group glass relative overflow-hidden rounded-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div
            key={current.id}
            className="animate-fade-up relative grid grid-cols-5 items-center gap-2 px-4 pb-10 pt-5 sm:px-10 md:grid-cols-2 md:gap-4 md:pb-14 md:pt-14"
          >
            <div className="col-span-3 text-left md:col-span-1">
              <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent sm:px-4 sm:py-1 sm:text-xs">
                {current.category_name || "New arrival"}
              </span>

              <h1 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight sm:mt-4 sm:text-4xl md:text-5xl">
                {current.name}
              </h1>

              {current.description && (
                <p className="mt-3 line-clamp-2 hidden text-muted sm:block sm:text-lg">
                  {current.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
                <p className="text-gradient text-xl font-extrabold sm:text-3xl">
                  {formatPrice(current.price)}
                </p>
                {current.stock <= 5 && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300 sm:px-3 sm:py-1 sm:text-xs">
                    Only {current.stock} left
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
                <Link
                  to={`/products/${current.id}`}
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm sm:px-8 sm:py-3 sm:text-base"
                >
                  Shop now
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={scrollToCatalog}
                  className="glass hidden rounded-full px-6 py-3 text-sm font-semibold transition hover:border-accent/60 hover:text-accent sm:block"
                >
                  Browse all
                </button>
              </div>
            </div>

            <div className="relative col-span-2 flex h-36 items-center justify-center sm:h-60 md:col-span-1 md:h-80">
              <div className="absolute h-28 w-28 rounded-full bg-accent/25 blur-3xl sm:h-56 sm:w-56" />
              <img
                src={current.image_url}
                alt={current.name}
                className="relative h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {slides.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="glass absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition hover:border-accent/60 hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 md:flex"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next slide"
                className="glass absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition hover:border-accent/60 hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 md:flex"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-4">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index % slides.length
                        ? "w-6 bg-accent"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />

          <div className="relative">
            <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Discover products{" "}
              <span className="text-gradient">you will love</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-muted sm:text-lg">
              Electronics, fashion, home essentials and more, delivered straight
              to your door.
            </p>

            <button
              onClick={scrollToCatalog}
              className="btn-gold mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3"
            >
              Shop now
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {tiles.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-extrabold">Shop by category</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {tiles.map((tile, i) => (
              <Link
                key={tile.id}
                to={`/?category=${tile.id}`}
                style={{ animationDelay: `${i * 70}ms` }}
                className="group glass card-glow animate-fade-up overflow-hidden rounded-2xl"
              >
                <div
                  className="flex h-32 items-center justify-center sm:h-40"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), transparent 65%)",
                  }}
                >
                  <img
                    src={tile.image}
                    alt={tile.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 p-4">
                  <p className="truncate font-bold">{tile.name}</p>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-accent transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
