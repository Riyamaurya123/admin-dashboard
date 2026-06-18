import Link from "next/link";

export default function ProductCard({ product, onToggleStock, onDeleteClick }) {
  const isInStock = product.stock > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <Link href={`/products/${product._id}`}>
        <h3 className="font-medium text-gray-900 hover:text-blue-600">
          {product.name}
        </h3>
      </Link>

      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
        {product.description}
      </p>

      <div className="flex items-center justify-between mt-3">
        <span className="font-semibold text-gray-900">₹{product.price}</span>
        <span className="text-xs bg-gray-100 text-black px-2 py-1 rounded">
          {product.category}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onToggleStock}
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isInStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isInStock ? `In stock (${product.stock})` : "Out of stock"}
        </button>

        <button
          onClick={onDeleteClick}
          className="text-xs text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
