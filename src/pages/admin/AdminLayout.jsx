import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Package, Tags, Wallet } from "lucide-react";
import api from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice.js";

const tabs = [
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tags }
];

function StatCard({ icon: Icon, label, value, note }) {
    return (
        <div className="glass card-glow rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon size={18} />
                </span>
            </div>

            {value === undefined ? (
                <div className="skeleton mt-4 h-8 w-24 rounded" />
            ) : (
                <p className="text-gradient mt-3 text-2xl font-extrabold">{value}</p>
            )}

            <p className="mt-1 h-4 text-xs text-muted">{note}</p>
        </div>
    );
}

export default function AdminLayout() {
    const { data: orders } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const res = await api.get("/orders/admin/all");
            return res.data;
        }
    });

    const { data: productTotal } = useQuery({
        queryKey: ["products", "admin-total"],
        queryFn: async () => {
            const res = await api.get("/products", { params: { limit: 1 } });
            return res.data.total;
        }
    });

    const { data: categoryCount } = useQuery({
        queryKey: ["categories", "admin-count"],
        queryFn: async () => {
            const res = await api.get("/categories");
            return res.data.length;
        }
    });

    const revenue = orders
        ? orders
              .filter((order) => order.status !== "cancelled")
              .reduce((sum, order) => sum + Number(order.total_amount), 0)
        : undefined;

    const pending = orders
        ? orders.filter((order) => order.status === "pending").length
        : undefined;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold">
                <span className="text-gradient">Admin Panel</span>
            </h1>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    icon={Wallet}
                    label="Revenue"
                    value={revenue === undefined ? undefined : formatPrice(revenue)}
                    note="Excluding cancelled"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Orders"
                    value={orders ? orders.length : undefined}
                    note={pending === undefined ? "" : `${pending} pending`}
                />
                <StatCard icon={Package} label="Products" value={productTotal} note="In catalog" />
                <StatCard icon={Tags} label="Categories" value={categoryCount} note="Active" />
            </div>

            <div className="mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="glass inline-flex gap-1 rounded-full p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-full px-5 py-2 text-sm transition ${
                                        isActive
                                            ? "btn-gold"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={16} />
                                {tab.label}
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            <Outlet />
        </div>
    );
}