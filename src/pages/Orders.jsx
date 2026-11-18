import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle,
  PackageOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatPrice } from "../utils/formatPrice.js";
import { formatDate } from "../utils/formatDate.js";

const steps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="skeleton mb-6 h-10 w-48 rounded" />

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <XCircle size={18} />
        This order was cancelled
      </div>
    );
  }

  const current = Math.max(
    steps.findIndex((step) => step.key === status),
    0,
  );
  const finished = status === "delivered";

  return (
    <ol className="flex items-start">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i < current || finished;
        const active = i === current && !finished;
        const reached = i <= current;

        return (
          <li
            key={step.key}
            className="relative flex flex-1 flex-col items-center text-center"
          >
            {i > 0 && (
              <span
                className={`absolute left-[-50%] right-[50%] top-[15px] h-0.5 ${
                  reached ? "bg-accent" : "bg-white/10"
                }`}
              />
            )}

            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                done
                  ? "bg-accent text-black"
                  : active
                  ? "bg-accent text-black ring-4 ring-accent/25"
                  : "glass text-muted"
              }`}
            >
              {done ? <Check size={16} /> : <Icon size={15} />}
            </span>

            <span
              className={`mt-2 text-xs ${
                reached ? "font-semibold text-white" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <OrdersSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold">
          <span className="text-gradient">My Orders</span>
        </h1>

        <div className="glass animate-fade-up mx-auto max-w-lg rounded-3xl px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <PackageOpen size={28} />
          </span>

          <p className="mt-5 text-xl font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-muted">
            You have not placed any orders yet.
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">
        <span className="text-gradient">My Orders</span>
        <span className="ml-3 text-base font-normal text-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <div
            key={order.id}
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
            className="glass animate-fade-up rounded-2xl p-5 sm:p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold">Order #{order.id}</p>
                <p className="text-sm text-muted">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <OrderProgress status={order.status} />

            <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4">
              {order.items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 py-3 text-sm"
                >
                  <Link
                    to={`/products/${item.product_id}`}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), rgba(255,255,255,0.03) 70%)",
                    }}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package size={18} className="text-muted" />
                    )}
                  </Link>

                  <Link
                    to={`/products/${item.product_id}`}
                    className="min-w-0 flex-1 truncate font-medium transition hover:text-accent"
                  >
                    {item.name}
                  </Link>

                  <div className="shrink-0 text-right">
                    <p className="text-muted">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                    <p className="font-semibold">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <p className="flex items-start gap-2 text-sm text-muted">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{order.shipping_address}</span>
              </p>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted">
                  Total
                </p>
                <p className="text-gradient text-2xl font-extrabold">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
