"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import DeleteModal from "./DeleteModal";

export default function ProductList({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial render pe server se aaya data use karte hain
  const [products, setProducts] = useState(initialData.products);
  const [categoryCounts, setCategoryCounts] = useState(
    initialData.categoryCounts,
  );
  const [pagination, setPagination] = useState(initialData.pagination);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- Section 5.1: Race condition fix ---
  // AbortController se purana request cancel karte hain jab naya fire hota hai
  // Isse slow response (purana request) aakar fast response (naya) ko overwrite nahi karega
  const abortControllerRef = useRef(null);

  // Pehli render ke baad se hi fetch karna hai — pehla render server data se ban gaya
  const isFirstRender = useRef(true);

  const fetchProducts = useCallback(async (params) => {
    // Purana pending request cancel karo
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.category) query.set("category", params.category);
      if (params.status) query.set("status", params.status);
      query.set("page", params.page);
      query.set("limit", 10);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${query.toString()}`,
        { signal: controller.signal },
      );

      if (!res.ok) throw new Error("Failed to load products");

      const json = await res.json();

      // Sirf tab update karo jab yeh request abort na hua ho
      setProducts(json.data.products);
      setCategoryCounts(json.data.categoryCounts);
      setPagination(json.data.pagination);
    } catch (err) {
      // AbortError ko ignore karo — yeh expected hai jab hum naya request bhejte hain
      if (err.name !== "AbortError") {
        setError("Something went wrong while loading products");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Debounce search input (300ms) ---
  // Har keystroke pe API call nahi karna — user ke type karna band hone ka wait karo
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1); // naya search aaya toh page 1 pe reset karo
      updateURLAndFetch({ search, category, status, page: 1 });
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Category/status filter change — debounce ki zaroorat nahi (dropdown click hai)
  useEffect(() => {
    if (isFirstRender.current) return;
    setPage(1);
    updateURLAndFetch({ search, category, status, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  // Page change
  useEffect(() => {
    if (isFirstRender.current) return;
    updateURLAndFetch({ search, category, status, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // URL update karo (shareable/bookmarkable) + data fetch karo
  // router.push se full reload nahi hota — sirf URL change hota hai
  const updateURLAndFetch = (params) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.status) query.set("status", params.status);
    query.set("page", params.page);

    router.push(`/products?${query.toString()}`, { scroll: false });
    fetchProducts(params);
  };

  // --- Section 5.2: Optimistic UI with rollback ---
  const handleToggleStock = async (product) => {
    const previousStock = product.stock;
    const newStock = product.stock > 0 ? 0 : 5; // toggle: out-of-stock <-> in-stock(5)

    // 1. UI turant update karo — server response wait nahi karna
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, stock: newStock } : p)),
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${product._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: newStock, version: product.version }),
        },
      );

      if (!res.ok) {
        throw new Error("Update failed");
      }

      const json = await res.json();

      // Server ka actual data set karo (version bhi update ho gaya hoga)
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? json.data : p)),
      );
    } catch (err) {
      // 2. API fail hua toh rollback — purani state pe wapas
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, stock: previousStock } : p,
        ),
      );
      setError("Failed to update stock. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${deleteTarget._id}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Delete failed");

      // List se hata do bina page reload kiye
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError("Failed to delete product");
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* --- Filters bar --- */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="" className="bg-gray-400">
            All categories
          </option>
          {categoryCounts.map((c) => (
            <option className="bg-black" key={c._id} value={c._id}>
              {c._id} ({c.count})
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="" className="bg-gray-400">
            All stock status
          </option>
          <option value="in-stock" className="bg-black">
            In stock
          </option>
          <option value="out-of-stock" className="bg-black">
            Out of stock
          </option>
        </select>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading indicator — purani list freeze nahi hoti, indicator dikhta hai */}
      {loading && (
        <div className="text-sm text-gray-500 mb-4">Loading products...</div>
      )}

      {/* Product grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${loading ? "opacity-50" : ""}`}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onToggleStock={() => handleToggleStock(product)}
            onDeleteClick={() => setDeleteTarget(product)}
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-10">No products found</p>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!pagination.hasPrevPage}
          className="px-4 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          productName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
