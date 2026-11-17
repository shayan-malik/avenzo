import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Headset } from "lucide-react";
import Logo from "./Logo.jsx";

const year = new Date().getFullYear();

const features = [
  { icon: ShieldCheck, title: "Secure", text: "Protected checkout and accounts" },
  { icon: Truck, title: "Fast Delivery", text: "Quick dispatch on every order" },
  { icon: Headset, title: "24/7 Support", text: "We are here whenever you need us" },
];

const links = [
  { to: "/", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
];

export default function Footer() {
  return (
    <footer className="mt-20">
      <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="glass card-glow flex items-center gap-4 rounded-2xl p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted">{feature.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo className="h-14" />

          <nav className="flex gap-6 text-sm text-muted">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="transition hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <p className="border-t border-white/10 py-5 text-center text-xs text-muted">
        © {year} Avenzo. All rights reserved.
      </p>
    </footer>
  );
}