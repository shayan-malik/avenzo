import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "./Logo.jsx";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const shopRef = useRef(null);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const closeMenu = () => setOpen(false);
  const closeShop = () => setShopOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // dropdown: bahar click ya Escape par band ho jaye
  useEffect(() => {
    if (!shopOpen) return;

    const onDown = (e) => {
      if (shopRef.current && !shopRef.current.contains(e.target)) {
        setShopOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShopOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [shopOpen]);

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
    `rounded-full px-4 py-1.5 text-sm transition ${
      isActive
        ? "bg-accent/15 font-semibold text-accent"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-base ${
      isActive
        ? "bg-accent/15 font-semibold text-accent"
        : "text-white hover:bg-white/5"
    }`;

  const dropdownItem =
    "block rounded-xl px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-accent";

  const isShopActive = location.pathname === "/";
  const initial = user?.first_name?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-nav">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo className="h-10 sm:h-12" />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="relative" ref={shopRef}>
              <button
                type="button"
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition ${
                  isShopActive
                    ? "bg-accent/15 font-semibold text-accent"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                Shop
                <ChevronDown
                  size={15}
                  className={`transition-transform ${shopOpen ? "rotate-180" : ""}`}
                />
              </button>

              {shopOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-xl">
                  <Link to="/" onClick={closeShop} className={dropdownItem}>
                    All products
                  </Link>

                  {categories.length > 0 && (
                    <div className="my-1 h-px bg-white/10" />
                  )}

                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/?category=${category.id}`}
                      onClick={closeShop}
                      className={dropdownItem}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <NavLink
                to="/cart"
                aria-label="Cart"
                className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:border-accent/60 hover:text-accent"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            )}

            {!loading &&
              (user ? (
                <>
                  <NavLink
                    to="/profile"
                    className="glass flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm text-white transition hover:border-accent/60"
                  >
                    <span className="btn-gold flex h-8 w-8 items-center justify-center rounded-full text-sm">
                      {initial}
                    </span>
                    {user.first_name}
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 transition hover:border-accent hover:text-accent"
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
                    className="btn-gold rounded-full px-5 py-2 text-sm"
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
            className="glass rounded-xl p-2 text-white hover:text-accent md:hidden"
          >
            <Menu size={22} />
          </button>
        </nav>
      </div>

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
              className="glass rounded-xl p-2 text-white hover:text-accent"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8 pt-4">
            <div className="space-y-1">
              <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>
                Products
              </NavLink>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/?category=${category.id}`}
                      onClick={closeMenu}
                      className="glass rounded-full px-3 py-1.5 text-xs text-white/80 hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {user && (
                <NavLink to="/cart" className={mobileLinkClass} onClick={closeMenu}>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">
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
              <div className="space-y-3 pt-8">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-accent py-3 text-base font-semibold text-accent hover:bg-accent hover:text-black"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="glass block w-full rounded-xl py-3 text-center text-base font-semibold text-white hover:text-accent"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenu}
                      className="btn-gold block w-full rounded-xl py-3 text-center text-base"
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