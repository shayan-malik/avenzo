import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice";
import { useQueryClient } from "@tanstack/react-query";

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
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [reloadKey, setReloadKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const queryClient = useQueryClient();

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
                toast.error("Categories could not be loaded");
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
                toast.error("Products could not be loaded");
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
            toast.error("Image must be smaller than 4MB.");
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
            toast.success("Image uploaded");
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
        if (!window.confirm(`"${product.name}" Do you want to delete it?`)) return;

        try {
            await api.delete(`/products/${product.id}`);
            toast.success("Product deleted successfully");
            refreshProductCache();

            if (editingId === product.id) handleCancelEdit();
            setReloadKey((key) => key + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Product could not be deleted");
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
            toast.error(error.response?.data?.message || "Product cannot be saved");
        } finally {
            setSaving(false);
        }
    };

    if (categories.length === 0) {
        return (
            <p className="text-muted">
                Before adding a product{" "}
                <Link to="/admin/categories" className="text-accent hover:underline">
                    add category
                </Link>
                .
            </p>
        );
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="max-w-2xl rounded-2xl border border-border bg-surface p-6"
            >
                <h2 className="mb-6 text-xl font-bold">
                    {editingId ? "Edit product" : "New product"}
                </h2>

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
                {uploading && (
                    <p className="mb-2 text-sm text-accent">Image is uploading...</p>
                )}

                <label className="mb-1 block text-sm text-muted">
                    Or enter the image URL yourself.
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

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="flex-1 rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
                    >
                        {saving
                            ? "Please Wait..."
                            : editingId
                            ? "Update karein"
                            : "Product add karein"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg border border-border px-6 py-3 font-semibold hover:border-accent"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h2 className="mb-4 mt-10 text-xl font-bold">
                All products ({products.length})
            </h2>

            {products.length === 0 ? (
                <p className="text-muted">There are no products yet.</p>
            ) : (
                <div className="space-y-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
                        >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-full w-full object-contain p-1"
                                    />
                                ) : (
                                    <span className="text-xs text-muted">No image</span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold">{product.name}</p>
                                <p className="text-sm text-muted">
                                    {product.category_name || "Bina category"} · Stock:{" "}
                                    {product.stock}
                                </p>
                            </div>

                            <p className="hidden font-semibold text-accent sm:block">
                                {formatPrice(product.price)}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}