import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { formatPrice } from "../utils/formatPrice.js";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const refreshCartCount = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
};

const refreshProductCache = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
};

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState("");
    const [placing, setPlacing] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
    const loadCart = async () => {
        try {
            const res = await api.get("/cart");
            setItems(res.data.items);
            setTotal(res.data.total);
        } catch {
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    loadCart();
}, [reloadKey]);

    const updateQuantity = async (item, newQty) => {
        try {
            await api.put(`/cart/${item.id}`, { quantity: newQty });
            refreshCartCount();
            setReloadKey((k) => k + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update quantity");
        }
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`/cart/${itemId}`);
            toast.success("Removed from cart");
            refreshCartCount();
            setReloadKey((k) => k + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove item");
        }
    };

    const placeOrder = async (e) => {
        e.preventDefault();

        if (!address.trim()) {
            return toast.error("Please enter a shipping address");
        }

        setPlacing(true);

        try {
            await api.post("/orders", { shipping_address: address });
            toast.success("Order placed successfully");
            refreshProductCache();
            refreshCartCount();
            navigate("/orders");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order");
            refreshProductCache();
            refreshCartCount();
            navigate("/orders");
            setReloadKey((k) => k + 1);
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return <p className="p-8 text-muted">Loading...</p>;
    }

    if (items.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-extrabold text-accent">Your Cart</h1>
                <p className="mt-4 text-muted">Your cart is empty</p>
                <Link
                    to="/"
                    className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-black hover:bg-accent-dark"
                >
                    Start shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">Your Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
                        >
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    <span className="text-xs text-muted">No image</span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col justify-between gap-2">
                                <div className="flex justify-between gap-2">
                                    <Link
                                        to={`/products/${item.product_id}`}
                                        className="font-bold hover:text-accent"
                                    >
                                        {item.name}
                                    </Link>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-sm text-muted hover:text-red-400"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <p className="text-sm text-muted">
                                    {formatPrice(item.price)} each
                                </p>

                                {item.quantity > item.stock && (
                                    <p className="text-xs text-red-400">
                                        Only {item.stock} left in stock
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center rounded-lg border border-border">
                                        <button
                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-3 py-1 hover:text-accent disabled:opacity-40"
                                        >
                                            −
                                        </button>
                                        <span className="min-w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="px-3 py-1 hover:text-accent disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="font-bold text-accent">
                                        {formatPrice(item.line_total)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <form
                    onSubmit={placeOrder}
                    className="h-fit rounded-2xl border border-border bg-surface p-6"
                >
                    <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-muted">Total</span>
                        <span className="text-2xl font-bold text-accent">{formatPrice(total)}</span>
                    </div>

                    <label className="mb-1 block text-sm text-muted">Shipping address</label>
                    <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House number, street, city..."
                        className="mb-4 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                    />

                    <button
                        type="submit"
                        disabled={placing}
                        className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
                    >
                        {placing ? "Please wait..." : "Place Order"}
                    </button>

                    <p className="mt-3 text-center text-xs text-muted">
                        Payment method: Cash on Delivery
                    </p>
                </form>
            </div>
        </div>
    );
}