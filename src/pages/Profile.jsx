import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, CalendarDays, ClipboardList, ShoppingCart, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import { formatDate } from "../utils/formatDate.js";

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07]";

const labelClass = "mb-1.5 block text-sm text-muted";

function ProfileSkeleton() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="skeleton mb-6 h-36 rounded-3xl" />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
                <div className="skeleton h-80 rounded-2xl" />
            </div>
        </div>
    );
}

export default function Profile() {
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get("/profile");
                setProfile(res.data);
                setForm({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name || "",
                    phone: res.data.phone || ""
                });
            } catch {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await api.put("/profile", form);
            setProfile((prev) => ({ ...prev, ...res.data.user }));
            updateUser(res.data.user);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                "Delete your account? You will be logged out and will not be able to log in again."
            )
        ) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete("/profile");
            toast.success("Account deleted successfully");

            try {
                await logout();
            } catch {
                // the server has already cleared the cookie
            }

            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account");
            setDeleting(false);
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return <p className="p-8 text-muted">Could not load your profile</p>;
    }

    const fullName = `${profile.first_name} ${profile.last_name || ""}`.trim();
    const initial = profile.first_name?.[0]?.toUpperCase() || "U";
    const isAdmin = profile.role === "admin";

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <section className="glass animate-fade-up relative mb-6 overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

                <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                    <span className="btn-gold flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-extrabold">
                        {initial}
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">
                                {fullName}
                            </h1>
                            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                                {isAdmin ? "Admin" : "Customer"}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted sm:justify-start">
                            <span className="flex items-center gap-2">
                                <Mail size={15} className="text-accent" />
                                {profile.email}
                            </span>
                            <span className="flex items-center gap-2">
                                <CalendarDays size={15} className="text-accent" />
                                Member since {formatDate(profile.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                <form
                    onSubmit={handleSubmit}
                    className="glass animate-fade-up rounded-2xl p-6 lg:col-span-2"
                >
                    <h2 className="mb-5 text-xl font-bold">Personal details</h2>

                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>First name</label>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Last name</label>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <label className={labelClass}>Email</label>
                    <input
                        value={profile.email}
                        disabled
                        className={`${inputClass} mb-1 opacity-60`}
                    />
                    <p className="mb-4 text-xs text-muted">Your email cannot be changed.</p>

                    <label className={labelClass}>Phone (optional)</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`${inputClass} mb-6`}
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-gold w-full rounded-full py-3 disabled:opacity-60"
                    >
                        {saving ? "Please wait..." : "Save changes"}
                    </button>
                </form>

                <div className="space-y-6">
                    <div className="glass animate-fade-up rounded-2xl p-3" style={{ animationDelay: "80ms" }}>
                        <Link
                            to="/orders"
                            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                                <ClipboardList size={18} />
                            </span>
                            <span className="flex-1 font-medium">My orders</span>
                            <ChevronRight size={18} className="text-muted" />
                        </Link>

                        <Link
                            to="/cart"
                            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                                <ShoppingCart size={18} />
                            </span>
                            <span className="flex-1 font-medium">My cart</span>
                            <ChevronRight size={18} className="text-muted" />
                        </Link>
                    </div>

                    <div
                        className="animate-fade-up rounded-2xl border border-red-500/30 bg-red-500/5 p-6"
                        style={{ animationDelay: "140ms" }}
                    >
                        <h2 className="text-lg font-bold text-red-400">Danger zone</h2>
                        <p className="mt-1 text-sm text-muted">
                            Deleting your account will deactivate it and log you out.
                        </p>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="mt-4 rounded-full border border-red-500/50 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                        >
                            {deleting ? "Please wait..." : "Delete account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}