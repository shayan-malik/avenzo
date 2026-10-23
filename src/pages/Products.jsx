import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.jsx";

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" }
];

const fieldClass =
    "rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

export default function Products() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    // categories: 5 minute cache
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/categories");
            return res.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // products: filters ya page badle to naya key banta hai, purane keys cache mein rehte hain
    const { data, isPending, isError, isPlaceholderData } = useQuery({
        queryKey: ["products", { search, category, sort, page }],
        queryFn: async () => {
            const res = await api.get("/products", {
                params: { search, category, sort, page, limit: 8 }
            });
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    const products = data?.products ?? [];
    const totalPages = data?.totalPages ?? 1;

    useEffect(() => {
        if (isError) {
            toast.error("Failed to load products");
        }
    }, [isError]);

    // search: typing rukne ke 500ms baad hi search chalao
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const changePage = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">Products</h1>

            <div className="mb-8 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`${fieldClass} min-w-60 flex-1`}
                />

                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                    className={fieldClass}
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    className={fieldClass}
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {isPending && <p className="text-muted">Loading...</p>}

            {!isPending && !isError && products.length === 0 && (
                <p className="text-muted">No products found</p>
            )}

            {products.length > 0 && (
                <div
                    className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                        isPlaceholderData ? "opacity-50" : ""
                    }`}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => changePage(page - 1)}
                        disabled={page === 1}
                        className="rounded-lg border border-border px-4 py-2 hover:border-accent disabled:opacity-40"
                    >
                        ← Prev
                    </button>

                    <span className="text-muted">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => changePage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-lg border border-border px-4 py-2 hover:border-accent disabled:opacity-40"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}