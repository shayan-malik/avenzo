import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  ChevronDown,
  User,
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "./Logo.jsx";

function SearchBar({ query, setQuery, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center rounded-full border border-white/10 bg-white/5 transition focus-within:border-accent/60 focus-within:bg-white/[0.07]"
    >
      <Search size={18} className="ml-4 shrink-0 text-muted" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted"
      />

      <button
        type="submit"
        className="btn-gold mr-1 hidden rounded-full px-5 py-1.5 text-sm sm:block"
      >
        Search
      </button>
    </form>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const accountRef = useRef(null);
  const accountTimer = useRef(null);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  const closeMenu = () => setOpen(false);

  const openAccount = () => {
    clearTimeout(accountTimer.current);
    setAccountOpen(true);
  };

  const closeAccountSoon = () => {
    clearTimeout(accountTimer.current);
    accountTimer.current = setTimeout(() => setAccountOpen(false), 150);
  };

  const closeAccount = () => {
    clearTimeout(accountTimer.current);
    setAccountOpen(false);
  };

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

  useEffect(() => {
    if (!accountOpen) return;

    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : "/");
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      closeAccount();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-base ${
      isActive
        ? "bg-accent/15 font-semibold text-accent"
        : "text-white hover:bg-white/5"
    }`;

  const menuItem =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-accent";

  const initial = user?.first_name?.[0]?.toUpperCase() || "U";
  const fullName = user
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "";

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-nav">
        <nav className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-3 py-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:grid-cols-[1fr_minmax(0,34rem)_1fr]">
            <Link to="/" className="shrink-0">
              <Logo className="h-10 sm:h-12" />
            </Link>

            {/* Desktop search */}
            <div className="hidden min-w-0 md:block">
              <div className="mx-auto w-full md:max-w-md lg:max-w-none">
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  onSubmit={handleSearch}
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3 md:justify-self-end">
              <div className="ml-auto flex items-center gap-2 md:gap-3 md:justify-self-end"></div>
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

              {/* Desktop account */}
              {!loading &&
                (user ? (
                  <div
                    ref={accountRef}
                    className="relative hidden md:block"
                    onMouseEnter={openAccount}
                    onMouseLeave={closeAccountSoon}
                  >
                    <button
                      type="button"
                      onClick={openAccount}
                      aria-haspopup="menu"
                      aria-expanded={accountOpen}
                      className="glass flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-white transition hover:border-accent/60"
                    >
                      <span className="btn-gold flex h-8 w-8 items-center justify-center rounded-full text-sm">
                        {initial}
                      </span>
                      <span className="max-w-24 truncate">
                        {user.first_name}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          accountOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-full z-50 w-60 pt-2">
                        <div className="rounded-2xl border border-white/10 bg-neutral-950 p-2 shadow-2xl">
                          <div className="border-b border-white/10 px-3 pb-3 pt-2">
                            <p className="truncate text-sm font-semibold">
                              {fullName}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {user.email}
                            </p>
                          </div>

                          <div className="pt-2">
                            <Link
                              to="/profile"
                              onClick={closeAccount}
                              className={menuItem}
                            >
                              <User size={16} />
                              My profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={closeAccount}
                              className={menuItem}
                            >
                              <ClipboardList size={16} />
                              My orders
                            </Link>
                            {user.role === "admin" && (
                              <Link
                                to="/admin"
                                onClick={closeAccount}
                                className={menuItem}
                              >
                                <LayoutDashboard size={16} />
                                Admin panel
                              </Link>
                            )}

                            <div className="my-1 h-px bg-white/10" />

                            <button
                              onClick={handleLogout}
                              className={`${menuItem} w-full hover:!text-red-400`}
                            >
                              <LogOut size={16} />
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden items-center gap-2 md:flex">
                    <Link
                      to="/login"
                      className="rounded-full px-4 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-gold rounded-full px-5 py-2 text-sm"
                    >
                      Signup
                    </Link>
                  </div>
                ))}

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="glass rounded-xl p-2.5 text-white hover:text-accent md:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
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
              <NavLink
                to="/"
                end
                className={mobileLinkClass}
                onClick={closeMenu}
              >
                Products
              </NavLink>

              {user && (
                <NavLink
                  to="/orders"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  Orders
                </NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  Admin
                </NavLink>
              )}

              {user && (
                <NavLink
                  to="/profile"
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
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
