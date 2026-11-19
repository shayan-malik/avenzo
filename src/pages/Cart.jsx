import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { formatPrice } from "../utils/formatPrice.js";

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="skeleton mb-6 h-10 w-48 rounded" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>

        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshProductCache = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  const refreshCartCount = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

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
      setReloadKey((k) => k + 1);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">
          <span className="text-gradient">Your Cart</span>
        </h1>

        <div className="glass animate-fade-up mx-auto max-w-lg rounded-3xl px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <ShoppingBag size={28} />
          </span>

          <p className="mt-5 text-xl font-bold">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">
            Looks like you have not added anything yet.
          </p>

          <Link
            to="/"
            className="btn-gold mt-6 inline-block rounded-full px-8 py-3"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">
        <span className="text-gradient">Your Cart</span>
        <span className="ml-3 text-base font-normal text-muted">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
              className="glass animate-fade-up flex gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4"
            >
              <Link
                to={`/products/${item.product_id}`}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl sm:h-28 sm:w-28"
                style={{
                  background:
                    "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), rgba(255,255,255,0.03) 70%)",
                }}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-contain p-1.5 sm:p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">No image</span>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="block truncate font-bold transition hover:text-accent sm:text-lg"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted sm:text-sm">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-full p-2 text-xs text-muted transition hover:bg-red-500/10 hover:text-red-400 sm:px-3 sm:py-1.5"
                  >
                    <Trash2 size={15} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

                {item.quantity > item.stock && (
                  <p className="text-xs text-red-400">
                    Only {item.stock} left in stock
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <div className="glass inline-flex shrink-0 items-center rounded-full">
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:text-accent disabled:opacity-40 sm:h-9 sm:w-9"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-7 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:text-accent disabled:opacity-40 sm:h-9 sm:w-9"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="text-gradient shrink-0 font-extrabold sm:text-lg">
                    {formatPrice(item.line_total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={placeOrder}
          className="glass animate-fade-up h-fit rounded-2xl p-6 lg:sticky lg:top-24"
        >
          <h2 className="mb-5 text-xl font-bold">Order Summary</h2>

          <div className="flex items-center justify-between text-sm text-muted">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>

          <div className="my-4 h-px bg-white/10" />

          <div className="mb-6 flex items-center justify-between">
            <span className="text-muted">Total</span>
            <span className="text-gradient text-3xl font-extrabold">
              {formatPrice(total)}
            </span>
          </div>

          <label className="mb-2 block text-sm text-muted">
            Shipping address
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House number, street, city..."
            className="mb-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-muted focus:border-accent/60"
          />

          <button
            type="submit"
            disabled={placing}
            className="btn-gold w-full rounded-full py-3.5 disabled:opacity-60"
          >
            {placing ? "Please wait..." : "Place Order"}
          </button>

          <div className="mt-5 space-y-2 text-xs text-white/70">
            <p className="flex items-center gap-2">
              <Banknote size={14} className="text-accent" />
              Payment method: Cash on Delivery
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent" />
              Secure checkout
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
