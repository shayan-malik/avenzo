import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UploadCloud, Package } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice.js";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: ""
};

const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07]";

const labelClass = "mb-1.5 block text-sm text-muted";

export default function AdminProducts() {
    const queryClient = useQueryClient();

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [reloadKey, setReloadKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const refreshProductCache = () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product"] });
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch {
                toast.error("Failed to load categories");
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await api.get("/products", { params: { limit: 50 } });
                setProducts(res.data.products);
            } catch {
                toast.error("Failed to load products");
            }
        };

        loadProducts();
    }, [reloadKey]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error("Image must be smaller than 4MB");
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
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Image upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description || "",
            price: String(product.price),
            stock: String(product.stock),
            image_url: product.image_url || "",
            category_id: String(product.category_id || "")
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

        try {
            await api.delete(`/products/${product.id}`);
            toast.success("Product deleted successfully");
            refreshProductCache();

            if (editingId === product.id) handleCancelEdit();
            setReloadKey((key) => key + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete product");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const body = {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: form.stock === "" ? 0 : Number(form.stock),
            image_url: form.image_url,
            category_id: Number(form.category_id)
        };

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, body);
                toast.success("Product updated successfully");
            } else {
                await api.post("/products", body);
                toast.success("Product added successfully");
            }

            refreshProductCache();
            setEditingId(null);
            setForm(emptyForm);
            setReloadKey((key) => key + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    if (categories.length === 0) {
        return (
            <div className="glass rounded-2xl px-6 py-14 text-center">
                <p className="text-lg font-semibold">No categories yet</p>
                <p className="mt-1 text-sm text-muted">
                    Please{" "}
                    <Link to="/admin/categories" className="text-accent hover:underline">
                        add a category
                    </Link>{" "}
                    before adding products.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-5">
            <form
                onSubmit={handleSubmit}
                className="glass h-fit rounded-2xl p-6 lg:col-span-2"
            >
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                        {editingId ? "Edit product" : "New product"}
                    </h2>
                    {editingId && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                            Editing
                        </span>
                    )}
                </div>

                <label className={labelClass}>Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`${inputClass} mb-4`}
                />

                <label className={labelClass}>Description</label>
                <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    className={`${inputClass} mb-4`}
                />

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Price</label>
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
                        <label className={labelClass}>Stock</label>
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

                <label className={labelClass}>Category</label>
                <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                    className={`${inputClass} mb-4 [&>option]:bg-neutral-900`}
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <label className={labelClass}>Product image</label>
                <label
                    className={`mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center transition hover:border-accent/60 hover:bg-white/[0.07] ${
                        uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                >
                    <UploadCloud size={26} className="text-accent" />
                    <span className="text-sm">
                        {uploading ? "Uploading image..." : "Click to upload an image"}
                    </span>
                    <span className="text-xs text-muted">PNG or JPG, up to 4MB</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                <label className={labelClass}>Or enter an image URL</label>
                <input
                    type="url"
                    name="image_url"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={handleChange}
                    className={`${inputClass} mb-4`}
                />

                {form.image_url && (
                    <div
                        className="mb-4 flex h-40 items-center justify-center rounded-xl border border-white/10"
                        style={{
                            background:
                                "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), rgba(255,255,255,0.03) 70%)"
                        }}
                    >
                        <img
                            src={form.image_url}
                            alt="Preview"
                            className="h-full w-full object-contain p-3"
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="btn-gold flex-1 rounded-full py-3 disabled:opacity-60"
                    >
                        {saving ? "Please wait..." : editingId ? "Update product" : "Add product"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="glass rounded-full px-6 py-3 font-semibold transition hover:border-accent/60 hover:text-accent"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="lg:col-span-3">
                <div className="mb-4 flex items-end justify-between">
                    <h2 className="text-xl font-bold">All products</h2>
                    <p className="text-sm text-muted">{products.length} total</p>
                </div>

                {products.length === 0 ? (
                    <div className="glass rounded-2xl px-6 py-14 text-center">
                        <p className="text-lg font-semibold">No products yet</p>
                        <p className="mt-1 text-sm text-muted">
                            Add your first product using the form.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.map((product, index) => {
                            let dotClass = "bg-green-400";
                            if (product.stock === 0) dotClass = "bg-red-400";
                            else if (product.stock <= 5) dotClass = "bg-amber-400";

                            return (
                                <div
                                    key={product.id}
                                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                                    className={`glass animate-fade-up flex items-center gap-4 rounded-xl p-3 transition ${
                                        editingId === product.id ? "border-accent/60" : ""
                                    }`}
                                >
                                    <div
                                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background:
                                                "radial-gradient(circle at 50% 40%, rgba(255,184,0,0.14), rgba(255,255,255,0.03) 70%)"
                                        }}
                                    >
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                loading="lazy"
                                                className="h-full w-full object-contain p-1"
                                            />
                                        ) : (
                                            <Package size={20} className="text-muted" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{product.name}</p>
                                        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
                                            <span>{product.category_name || "No category"}</span>
                                            <span className="flex items-center gap-1.5">
                                                <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                                                Stock: {product.stock}
                                            </span>
                                        </p>
                                    </div>

                                    <p className="text-gradient hidden font-bold sm:block">
                                        {formatPrice(product.price)}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            aria-label={`Edit ${product.name}`}
                                            className="glass flex h-9 w-9 items-center justify-center rounded-full transition hover:border-accent/60 hover:text-accent"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            aria-label={`Delete ${product.name}`}
                                            className="glass flex h-9 w-9 items-center justify-center rounded-full text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}