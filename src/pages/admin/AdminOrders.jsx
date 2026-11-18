import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import { formatDate } from "../../utils/formatDate.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
    const queryClient = useQueryClient();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await api.get("/orders/admin/all", {
                    params: { status: statusFilter }
                });
                setOrders(res.data);
            } catch {
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [statusFilter, reloadKey]);

    const changeStatus = async (order, newStatus) => {
        if (newStatus === order.status) {
            return;
        }

        if (
            newStatus === "cancelled" &&
            !window.confirm("Cancel this order? This cannot be undone.")
        ) {
            return;
        }

        try {
            await api.put(`/orders/${order.id}/status`, { status: newStatus });
            toast.success(`Order #${order.id}: ${newStatus}`);

            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

            if (newStatus === "cancelled") {
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["product"] });
            }

            setReloadKey((k) => k + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const pillClass = (active) =>
        `shrink-0 rounded-full px-4 py-1.5 text-sm capitalize transition ${
            active ? "btn-gold" : "glass text-white/80 hover:border-accent/50 hover:text-white"
        }`;

    if (loading) {
        return (
            <div className="space-y-6">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-56 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button onClick={() => setStatusFilter("")} className={pillClass(statusFilter === "")}>
                        All
                    </button>
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={pillClass(statusFilter === status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <p className="text-sm text-muted">
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                </p>
            </div>

            {orders.length === 0 && (
                <div className="glass rounded-2xl px-6 py-14 text-center">
                    <p className="text-lg font-semibold">No orders found</p>
                    <p className="mt-1 text-sm text-muted">Try a different status filter.</p>
                </div>
            )}

            <div className="space-y-6">
                {orders.map((order, index) => (
                    <div
                        key={order.id}
                        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                        className="glass animate-fade-up rounded-2xl p-5 sm:p-6"
                    >
                        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-bold">Order #{order.id}</p>
                                <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                                <p className="mt-1 text-sm">
                                    {order.first_name} {order.last_name}
                                    <span className="text-muted"> · {order.email}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <StatusBadge status={order.status} />
                                <select
                                    value={order.status}
                                    onChange={(e) => changeStatus(order, e.target.value)}
                                    disabled={order.status === "cancelled"}
                                    className="glass rounded-full bg-transparent px-4 py-2 text-sm capitalize outline-none focus:border-accent/60 disabled:opacity-50 [&>option]:bg-neutral-900"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-4">
                            {order.items.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center gap-4 py-3 text-sm"
                                >
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background:
                                                "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), rgba(255,255,255,0.03) 70%)"
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
                                            <Package size={16} className="text-muted" />
                                        )}
                                    </div>

                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {item.name}
                                    </span>

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

                            <p className="text-gradient text-2xl font-extrabold">
                                {formatPrice(order.total_amount)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}