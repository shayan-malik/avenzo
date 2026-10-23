import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import { formatDate } from "../utils/formatDate.js";

const inputClass =
    "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

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
                    last_name: res.data.last_name,
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
                // cookie server ne pehle hi clear kar di hai
            }

            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account");
            setDeleting(false);
        }
    };

    if (loading) {
        return <p className="p-8 text-muted">Loading...</p>;
    }

    if (!profile) {
        return <p className="p-8 text-muted">Could not load your profile</p>;
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">My Profile</h1>

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-border bg-surface p-6"
            >
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm text-muted">First name</label>
                        <input
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted">Last name</label>
                        <input
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                <label className="mb-1 block text-sm text-muted">Email</label>
                <input
                    value={profile.email}
                    disabled
                    className={`${inputClass} mb-4 opacity-60`}
                />

                <label className="mb-1 block text-sm text-muted">Phone (optional)</label>
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`${inputClass} mb-4`}
                />

                <p className="mb-6 text-sm text-muted">
                    Member since {formatDate(profile.created_at)}
                </p>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
                >
                    {saving ? "Please wait..." : "Save changes"}
                </button>
            </form>

            <div className="mt-8 rounded-2xl border border-red-500/40 p-6">
                <h2 className="text-lg font-bold text-red-400">Danger zone</h2>
                <p className="mt-1 text-sm text-muted">
                    Deleting your account will deactivate it and log you out.
                </p>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                >
                    {deleting ? "Please wait..." : "Delete account"}
                </button>
            </div>
        </div>
    );
}