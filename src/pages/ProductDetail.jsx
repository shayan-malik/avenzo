import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    ShieldCheck,
    Truck,
    Banknote
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import { formatPrice } from "../utils/formatPrice.js";
import NotFound from "./NotFound.jsx";

const trustPoints = [
    { icon: Banknote, label: "Cash on Delivery" },
    { icon: ShieldCheck, label: "Secure checkout" },
    { icon: Truck, label: "Fast delivery" }
];

function ProductSkeleton() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="skeleton mb-6 h-9 w-40 rounded-full" />

            <div className="grid gap-8 md:grid-cols-2">
                <div className="skeleton h-96 rounded-3xl" />

                <div className="space-y-4">
                    <div className="skeleton h-6 w-28 rounded-full" />
                    <div className="skeleton h-10 w-3/4 rounded" />
                    <div className="skeleton h-9 w-40 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-12 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
}

function ProductView({ product }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const addToCart = async (goToCart) => {
        if (!user) {
            toast.error("Please log in first");
            return navigate("/login");
        }

        setAdding(true);

        try {
            await api.post("/cart", { product_id: product.id, quantity });
            toast.success("Added to cart");
            queryClient.invalidateQueries({ queryKey: ["cart"] });

            if (goToCart) {
                navigate("/cart");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setAdding(false);
        }
    };

    const outOfStock = product.stock === 0;

    let stockText = `${product.stock} in stock`;
    let dotClass = "bg-green-400";

    if (outOfStock) {
        stockText = "Out of stock";
        dotClass = "bg-red-400";
    } else if (product.stock <= 5) {
        stockText = `Only ${product.stock} left`;
        dotClass = "bg-amber-400";
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Link
                to="/"
                className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition hover:border-accent/50 hover:text-accent"
            >
                <ArrowLeft size={16} />
                Back to products
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                <div
                    className="glass animate-fade-up flex h-96 items-center justify-center rounded-3xl md:sticky md:top-24 md:h-[28rem]"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.18), rgba(255,255,255,0.03) 70%)"
                    }}
                >
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className={`h-full w-full object-contain p-8 ${
                                outOfStock ? "opacity-50 grayscale" : ""
                            }`}
                        />
                    ) : (
                        <span className="text-muted">No image</span>
                    )}
                </div>

                <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
                    {product.category_name && (
                        <span className="glass inline-block rounded-full px-4 py-1 text-xs font-semibold text-accent">
                            {product.category_name}
                        </span>
                    )}

                    <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                        {product.name}
                    </h1>

                    <p className="text-gradient mt-4 text-4xl font-extrabold">
                        {formatPrice(product.price)}
                    </p>

                    <div className="glass mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
                        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                        {stockText}
                    </div>

                    {product.description && (
                        <p className="mt-6 leading-relaxed text-muted">{product.description}</p>
                    )}

                    <div className="glass mt-8 rounded-2xl p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                                    Quantity
                                </p>
                                <div className="glass inline-flex items-center rounded-full">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={outOfStock || quantity <= 1}
                                        aria-label="Decrease quantity"
                                        className="flex h-10 w-10 items-center justify-center rounded-full hover:text-accent disabled:opacity-40"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="min-w-10 text-center font-semibold">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity((q) => Math.min(product.stock, q + 1))
                                        }
                                        disabled={outOfStock || quantity >= product.stock}
                                        aria-label="Increase quantity"
                                        className="flex h-10 w-10 items-center justify-center rounded-full hover:text-accent disabled:opacity-40"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="mb-1 text-xs uppercase tracking-wider text-muted">
                                    Total
                                </p>
                                <p className="text-2xl font-extrabold">
                                    {formatPrice(Number(product.price) * quantity)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => addToCart(false)}
                                disabled={outOfStock || adding}
                                className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-full py-3 disabled:opacity-50"
                            >
                                <ShoppingCart size={18} />
                                {outOfStock ? "Out of stock" : adding ? "Please wait..." : "Add To Cart"}
                            </button>

                            <button
                                onClick={() => addToCart(true)}
                                disabled={outOfStock || adding}
                                className="glass flex-1 rounded-full py-3 font-semibold transition hover:border-accent/60 hover:text-accent disabled:opacity-50"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {trustPoints.map((point) => {
                            const Icon = point.icon;

                            return (
                                <span
                                    key={point.label}
                                    className="flex items-center gap-2 text-xs text-white/70"
                                >
                                    <Icon size={14} className="text-accent" />
                                    {point.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();

    const { data: product, isPending, isError, error } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            return res.data;
        },
        retry: (failureCount, err) => {
            const status = err.response?.status;
            if (status === 404 || status === 400) return false;
            return failureCount < 1;
        }
    });

    const status = error?.response?.status;
    const notFound = isError && (status === 404 || status === 400);

    useEffect(() => {
        if (isError && !notFound) {
            toast.error("Failed to load product");
        }
    }, [isError, notFound]);

    if (isPending) {
        return <ProductSkeleton />;
    }

    if (notFound) {
        return <NotFound />;
    }

    if (isError || !product) {
        return (
            <div className="p-8">
                <p className="text-muted">Could not load this product</p>
                <Link to="/" className="mt-4 inline-block text-accent hover:underline">
                    ← Back to products
                </Link>
            </div>
        );
    }

    return <ProductView key={product.id} product={product} />;
}