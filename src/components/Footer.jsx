import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Truck, Headset, Banknote, ArrowUp } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "./Logo.jsx";

const year = new Date().getFullYear();

const perks = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Fast delivery" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Headset, label: "24/7 support" },
];

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const linkClass = "text-sm text-muted transition hover:text-accent";

export default function Footer() {
  const { user } = useAuth();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <footer className="mt-20">
      <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo className="h-14" />

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Your one-stop online store for electronics, fashion, home essentials
              and more, delivered straight to your door.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" onClick={scrollTop} className={linkClass}>
                  All products
                </Link>
              </li>
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/?category=${category.id}`}
                    onClick={scrollTop}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Account
            </h4>
            <ul className="space-y-3">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" onClick={scrollTop} className={linkClass}>
                      My profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" onClick={scrollTop} className={linkClass}>
                      My cart
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={scrollTop} className={linkClass}>
                      My orders
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <Link to="/admin" onClick={scrollTop} className={linkClass}>
                        Admin panel
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={scrollTop} className={linkClass}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" onClick={scrollTop} className={linkClass}>
                      Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 py-6">
          {perks.map((perk) => {
            const Icon = perk.icon;

            return (
              <li
                key={perk.label}
                className="flex items-center gap-2 text-xs text-white/70"
              >
                <Icon size={15} className="text-accent" />
                {perk.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row">
          <p>© {year} Avenzo. All rights reserved.</p>

          <p>
            Designed & built by{" "}
            <a
              href="https://github.com/shayan-malik"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Shayan Malik
            </a>
          </p>

          <button
            onClick={scrollTop}
            className="glass flex items-center gap-2 rounded-full px-4 py-1.5 transition hover:border-accent/60 hover:text-accent"
          >
            Back to top
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}