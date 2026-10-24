import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "./Logo.jsx";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  const closeMenu = () => setOpen(false);

  // menu khula ho to peeche ka page scroll na ho
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // screen bari ho jaye to mobile menu khud band ho jaye
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "border-b-2 border-accent pb-1 font-semibold text-accent"
      : "pb-1 text-white hover:text-accent";

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-4 text-xl ${
      isActive
        ? "bg-surface font-semibold text-accent"
        : "text-white hover:bg-surface"
    }`;

  const cartBadge = cartCount > 0 && (
    <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">
      {cartCount}
    </span>
  );

  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/">
          <Logo className="h-10 sm:h-14" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm md:flex">
          <NavLink to="/" end className={linkClass}>
            Products
          </NavLink>

          {user && (
            <NavLink to="/cart" className={linkClass}>
              Cart
              {cartBadge}
            </NavLink>
          )}

          {user && (
            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {!loading &&
            (user ? (
              <>
                <NavLink to="/profile" className={linkClass}>
                  {user.first_name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-accent px-4 py-1.5 font-semibold text-accent hover:bg-accent hover:text-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <Link
                  to="/signup"
                  className="rounded-lg bg-accent px-4 py-1.5 font-semibold text-black hover:bg-accent-dark"
                >
                  Signup
                </Link>
              </>
            ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg border border-border p-2 text-white hover:border-accent hover:text-accent md:hidden"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Link to="/" onClick={closeMenu}>
              <Logo className="h-10" />
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="rounded-lg border border-border p-2 text-white hover:border-accent hover:text-accent"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 pt-4">
            <div className="space-y-1">
              <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>
                Products
              </NavLink>

              {user && (
                <NavLink to="/cart" className={mobileLinkClass} onClick={closeMenu}>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-black">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
              )}

              {user && (
                <NavLink to="/orders" className={mobileLinkClass} onClick={closeMenu}>
                  Orders
                </NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink to="/admin" className={mobileLinkClass} onClick={closeMenu}>
                  Admin
                </NavLink>
              )}

              {user && (
                <NavLink to="/profile" className={mobileLinkClass} onClick={closeMenu}>
                  Profile ({user.first_name})
                </NavLink>
              )}
            </div>

            {!loading && (
              <div className="mt-auto space-y-3 pt-8">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-accent py-3.5 text-lg font-semibold text-accent hover:bg-accent hover:text-black"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="block w-full rounded-xl border border-border py-3.5 text-center text-lg font-semibold text-white hover:border-accent hover:text-accent"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenu}
                      className="block w-full rounded-xl bg-accent py-3.5 text-center text-lg font-semibold text-black hover:bg-accent-dark"
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}