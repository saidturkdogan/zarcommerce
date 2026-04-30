'use client';

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/products`);

        if (!response.ok) {
          throw new Error(`Urunler alinamadi (${response.status})`);
        }

        const data = (await response.json()) as Product[];
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <p className="text-brand-dark/70">Urunler yukleniyor...</p>;
  }

  if (error) {
    return <p className="text-red-600">Backend baglantisi hatasi: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <div key={product.id} className="group rounded-3xl border border-gray-100 overflow-hidden bg-white hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-300">
          <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1 rounded-full">
              {product.category}
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-brand-dark mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors">
              {product.name}
            </h3>
            <div className="text-xl font-bold text-brand-purple">
              {product.price.toLocaleString("tr-TR")} TL
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
