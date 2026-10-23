import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useQueryClient } from "@tanstack/react-query";

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
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="New category (e.g. Beauty)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Please wait..." : editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rounded-lg border border-border px-4 py-2 font-semibold hover:border-accent"
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="mb-3 text-lg font-bold">
        Categories ({categories.length})
      </h2>

      {categories.length === 0 ? (
        <p className="text-muted">No categories yet</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5"
            >
              <span className="truncate font-medium">{category.name}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category)}
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