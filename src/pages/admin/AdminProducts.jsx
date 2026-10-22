import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: ""
};

const inputClass =
    "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

export default function AdminProducts() {
    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch {
                toast.error("Categories load nahi ho sakin");
            }
        };

        loadCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error("Image 4MB se chhoti honi chahiye");
            e.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setUploading(true);

        try {
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setForm((prev) => ({ ...prev, image_url: res.data.url }));
            toast.success("Image upload ho gayi");
        } catch (error) {
            toast.error(error.response?.data?.message || "Image upload nahi ho saki");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.post("/products", {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                stock: form.stock === "" ? 0 : Number(form.stock),
                image_url: form.image_url,
                category_id: Number(form.category_id)
            });

            toast.success("Product add ho gaya");
            setForm(emptyForm);
        } catch (error) {
            toast.error(error.response?.data?.message || "Product add nahi ho saka");
        } finally {
            setSaving(false);
        }
    };

    if (categories.length === 0) {
        return (
            <p className="text-muted">
                Product add karne se pehle{" "}
                <Link to="/admin/categories" className="text-accent hover:underline">
                    category add karein
                </Link>
                .
            </p>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl rounded-2xl border border-border bg-surface p-6"
        >
            <h2 className="mb-6 text-xl font-bold">Naya product</h2>

            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`${inputClass} mb-4`}
            />

            <label className="mb-1 block text-sm text-muted">Description</label>
            <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} mb-4`}
            />

            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm text-muted">Price</label>
                    <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-muted">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>
            </div>

            <label className="mb-1 block text-sm text-muted">Category</label>
            <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className={`${inputClass} mb-4`}
            >
                <option value="">Category chunein</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>

            <label className="mb-1 block text-sm text-muted">Product image</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mb-2 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-black hover:file:bg-accent-dark disabled:opacity-60"
            />
            {uploading && <p className="mb-2 text-sm text-accent">Image upload ho rahi hai...</p>}

            <label className="mb-1 block text-sm text-muted">
                Ya image ka URL khud daalein
            </label>
            <input
                type="url"
                name="image_url"
                placeholder="https://..."
                value={form.image_url}
                onChange={handleChange}
                className={`${inputClass} mb-4`}
            />

            {form.image_url && (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-surface-2">
                    <img
                        src={form.image_url}
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
            >
                {saving ? "Wait..." : "Product add karein"}
            </button>
        </form>
    );
}