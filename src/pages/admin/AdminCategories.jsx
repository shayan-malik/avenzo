import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Tag } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const queryClient = useQueryClient();

  const refreshCache = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
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
  }, [reloadKey]);

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`))
      return;

    try {
      await api.delete(`/categories/${category.id}`);
      toast.success("Category deleted successfully");
      refreshCache();

      if (editingId === category.id) handleCancelEdit();
      setReloadKey((k) => k + 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Please enter a category name");
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", { name });
        toast.success("Category added successfully");
      }

      refreshCache();
      setEditingId(null);
      setName("");
      setReloadKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="glass h-fit rounded-2xl p-6 lg:col-span-2"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            {editingId ? "Edit category" : "New category"}
          </h2>
          {editingId && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Editing
            </span>
          )}
        </div>

        <label className="mb-1.5 block text-sm text-muted">Category name</label>
        <input
          type="text"
          placeholder="e.g. Beauty"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07]"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold flex-1 rounded-full py-3 disabled:opacity-60"
          >
            {saving
              ? "Please wait..."
              : editingId
                ? "Update category"
                : "Add category"}
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
          <h2 className="text-xl font-bold">All categories</h2>
          <p className="text-sm text-muted">{categories.length} total</p>
        </div>

        {categories.length === 0 ? (
          <div className="glass rounded-2xl px-6 py-14 text-center">
            <p className="text-lg font-semibold">No categories yet</p>
            <p className="mt-1 text-sm text-muted">
              Add your first category using the form.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                className={`glass animate-fade-up flex items-center gap-4 rounded-xl p-3 transition ${
                  editingId === category.id ? "border-accent/60" : ""
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Tag size={18} />
                </span>

                <p className="min-w-0 flex-1 truncate font-semibold">
                  {category.name}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="glass flex h-9 w-9 items-center justify-center rounded-full transition hover:border-accent/60 hover:text-accent"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    className="glass flex h-9 w-9 items-center justify-center rounded-full text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}