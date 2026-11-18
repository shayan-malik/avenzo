import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, ShieldCheck, Truck, Banknote, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import { useSearchParams } from "react-router-dom";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

const trustChips = [
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Fast delivery" },
];

export default function Products() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [prevCategory, setPrevCategory] = useState(category);

if (category !== prevCategory) {
    setPrevCategory(category);
    setPage(1);
}

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ["products", { search, category, sort, page }],
    queryFn: async () => {
      const res = await api.get("/products", {
        params: { search, category, sort, page, limit: 8 },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load products");
    }
  }, [isError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const changePage = (newPage) => {
    setPage(newPage);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const selectCategory = (id) => {
    setSearchParams(id ? { category: id } : {});
    setPage(1);
};

  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const showHero = !search && !category && page === 1;

  const pillClass = (active) =>
    `shrink-0 rounded-full px-5 py-2 text-sm transition ${
      active
        ? "btn-gold"
        : "glass text-white/80 hover:border-accent/50 hover:text-white"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {showHero && (
        <section className="glass animate-fade-up relative mb-12 overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

          <div className="relative">
            <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              New arrivals
            </span>

            <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
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
              <ArrowDown size={18} />
            </button>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {trustChips.map((chip) => {
                const Icon = chip.icon;

                return (
                  <span
                    key={chip.label}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/80"
                  >
                    <Icon size={14} className="text-accent" />
                    {chip.label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div id="catalog" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-3xl font-extrabold">
            <span className="text-gradient">Products</span>
          </h2>
          {!isPending && <p className="text-sm text-muted">{total} products</p>}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="glass flex min-w-60 flex-1 items-center gap-3 rounded-full px-4 focus-within:border-accent/60">
            <Search size={18} className="text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent py-2.5 outline-none placeholder:text-muted"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="glass rounded-full bg-transparent px-5 py-2.5 text-sm outline-none focus:border-accent/60 [&>option]:bg-neutral-900"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => selectCategory("")}
            className={pillClass(category === "")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(String(cat.id))}
              className={pillClass(category === String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isPending && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isPending && !isError && products.length === 0 && (
          <div className="glass rounded-2xl px-6 py-14 text-center">
            <p className="text-lg font-semibold">No products found</p>
            <p className="mt-1 text-sm text-muted">
              Try a different search or category.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div
            className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              isPlaceholderData ? "opacity-50" : ""
            }`}
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="glass rounded-full px-5 py-2 text-sm transition hover:border-accent/60 disabled:opacity-40"
            >
              ← Prev
            </button>

            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="glass rounded-full px-5 py-2 text-sm transition hover:border-accent/60 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
