'use client';

import { useEffect, useState } from "react";
import { ShoppingCart, Heart, ExternalLink, Star } from "lucide-react";

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
          throw new Error(`Ürünler alınamadı (${response.status})`);
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
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded-3xl border border-gray-100 bg-white p-4 h-96 flex flex-col animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="w-1/3 h-6 bg-gray-200 rounded-full mb-3"></div>
            <div className="w-3/4 h-5 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-1/2 h-5 bg-gray-200 rounded-full mb-auto"></div>
            <div className="w-1/3 h-8 bg-gray-200 rounded-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
        <p className="text-red-600 font-medium">Ürünler yüklenirken bir hata oluştu: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product) => (
        <div key={product.id} className="group flex flex-col bg-white rounded-[32px] border border-gray-100/80 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(64,29,143,0.1)] hover:-translate-y-1 transition-all duration-300">
          <div className="aspect-[4/3] bg-gray-50/50 relative overflow-hidden flex items-center justify-center p-6 group-hover:bg-brand-purple/5 transition-colors">
            {/* Image Placeholder (replace with actual image) */}
            <div className="w-32 h-32 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
              <span className="text-4xl">📦</span>
            </div>
            
            {/* Tags */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white text-brand-dark shadow-sm border border-gray-100">
                {product.category}
              </span>
            </div>

            {/* Quick Actions (Hover) */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <button className="w-10 h-10 rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm border border-gray-100 transition-colors">
                <Heart size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white text-gray-500 hover:text-brand-purple hover:bg-brand-purple/10 flex items-center justify-center shadow-sm border border-gray-100 transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-1 mb-3 text-brand-yellow">
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current" />
              <Star size={14} className="fill-current text-gray-300" />
              <span className="text-xs text-gray-400 ml-1 font-medium">(4.0)</span>
            </div>

            <h3 className="font-semibold text-brand-dark text-lg mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors leading-tight">
              {product.name}
            </h3>
            
            <div className="mt-auto pt-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through font-medium">{(product.price * 1.2).toLocaleString("tr-TR", {maximumFractionDigits: 0})} TL</span>
                <span className="text-2xl font-black text-brand-dark">
                  {product.price.toLocaleString("tr-TR")} <span className="text-sm text-brand-purple font-bold">TL</span>
                </span>
              </div>
              <button className="w-12 h-12 rounded-2xl bg-brand-dark text-white hover:bg-brand-purple flex items-center justify-center transition-colors group-hover:rotate-12">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
