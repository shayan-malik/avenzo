import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
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
    `self-start md:self-auto ${
      isActive
        ? "border-b-2 border-accent pb-1 font-semibold text-accent"
        : "pb-1 text-white hover:text-accent"
    }`;

  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-4 py-3">
        <Link to="/" onClick={closeMenu}>
          <Logo className="h-10 sm:h-14" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menu"
          className="rounded-lg border border-border p-2 text-white hover:border-accent hover:text-accent md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } w-full flex-col gap-4 pb-2 pt-4 text-sm md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:p-0`}
        >
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            Products
          </NavLink>

          {user && (
            <NavLink to="/cart" className={linkClass} onClick={closeMenu}>
              Cart
              {cartCount > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {user && (
            <NavLink to="/orders" className={linkClass} onClick={closeMenu}>
              Orders
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass} onClick={closeMenu}>
              Admin
            </NavLink>
          )}

          {!loading &&
            (user ? (
              <>
                <NavLink
                  to="/profile"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  {user.first_name}
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="self-start rounded-lg border border-accent px-4 py-1.5 font-semibold text-accent hover:bg-accent hover:text-black md:self-auto"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                  Login
                </NavLink>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="self-start rounded-lg bg-accent px-4 py-1.5 font-semibold text-black hover:bg-accent-dark md:self-auto"
                >
                  Signup
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}
