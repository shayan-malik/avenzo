import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, Banknote } from "lucide-react";

const year = new Date().getFullYear();

const points = [
    { icon: ShieldCheck, title: "Secure sign-in", text: "Protected accounts and checkout" },
    { icon: Truck, title: "Fast delivery", text: "Quick dispatch on every order" },
    { icon: Banknote, title: "Cash on Delivery", text: "Pay when your order arrives" }
];

export default function AuthLayout() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative px-4 py-4">
                <Link
                    to="/"
                    className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition hover:border-accent/50 hover:text-accent"
                >
                    <ArrowLeft size={16} />
                    Back to store
                </Link>
            </div>

            <main className="relative flex flex-1 items-center">
                <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-6 lg:grid-cols-2">
                    <aside className="hidden lg:block">
                        <h2 className="text-5xl font-extrabold leading-tight">
                            Shop smarter, <span className="text-gradient">checkout faster</span>
                        </h2>

                        <p className="mt-5 max-w-md text-lg text-muted">
                            Create an account to track your orders, save your cart and enjoy a
                            smoother shopping experience.
                        </p>

                        <div className="mt-10 space-y-4">
                            {points.map((point) => {
                                const Icon = point.icon;

                                return (
                                    <div
                                        key={point.title}
                                        className="glass flex max-w-md items-center gap-4 rounded-2xl p-4"
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                                            <Icon size={20} />
                                        </span>
                                        <div>
                                            <p className="font-semibold">{point.title}</p>
                                            <p className="text-sm text-muted">{point.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>

                    <div>
                        <Outlet />
                    </div>
                </div>
            </main>

            <p className="relative py-4 text-center text-xs text-muted">
                © {year} Avenzo. All rights reserved.
            </p>
        </div>
    );
}