// Yeh function server pe chalta hai — page request aane par
// Iska data HTML mein already present hota hai (SSR)

import ProductList from "@/components/ProductList";

// Isliye "View Page Source" karne pe products dikhenge — SEO/fast-load ke liye zaroori
async function getInitialProducts() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=1&limit=10`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  return res.json();
}
export default async function ProductsPage() {
  const initialData = await getInitialProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>

        <a
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Add Product
        </a>
      </div>

      {/* 
        ProductList ek Client Component hai.
        Hum yahan initial data pass kar rahe hain taaki:
        1. Pehla render server se aaya HTML use kare (no loading flash)
        2. Uske baad search/filter/pagination client-side handle ho
      */}
      <ProductList initialData={initialData.data} />
    </div>
  );
}
