'use client';

import { useEffect, useState } from "react";
import { ShoppingCart, Heart, ExternalLink, Star, Check } from "lucide-react";
import { PRODUCT_API_BASE, USER_API_BASE } from "../../lib/api";
import { useCart } from "../../lib/cart";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
};

type ProductGridProps = {
  accessToken: string | null;
  onRequireLogin: () => void;
  onSessionExpired: () => void;
  searchQuery?: string;
  selectedCategory?: string | null;
};

export default function ProductGrid({ accessToken, onRequireLogin, onSessionExpired, searchQuery, selectedCategory }: Readonly<ProductGridProps>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]); // animation state
  const cart = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${PRODUCT_API_BASE}/api/v1/products`);

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

  useEffect(() => {
    if (!accessToken) {
      setFavoriteIds([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${USER_API_BASE}/api/v1/wishlist/product-ids`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 401) {
          onSessionExpired();
          return;
        }
        if (!res.ok) return;
        const ids = (await res.json()) as number[];
        setFavoriteIds(ids);
      } catch {
        /* ignore */
      }
    })();
  }, [accessToken, onSessionExpired]);

  const toggleFavorite = async (productId: number) => {
    if (!accessToken) {
      onRequireLogin();
      return;
    }

    const isFavorite = favoriteIds.includes(productId);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const res = await fetch(`${USER_API_BASE}/api/v1/wishlist/products/${productId}`, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) return;
      setFavoriteIds((prev) =>
        isFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    } catch {
      /* ignore */
    }
  };

  const handleAddToCart = (product: Product) => {
    cart.addItem(product);
    // Show animation
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1200);
  };

  // Filter by search + category
  const filtered = products.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || (p.category ?? "").toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

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

  if (filtered.length === 0) {
    return (
      <div className="p-12 bg-white border border-gray-100 rounded-3xl text-center">
        <p className="text-gray-400 text-lg font-medium">Aramanızla eşleşen ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {filtered.map((product) => {
        const isAdded = addedIds.includes(product.id);
        return (
        <div key={product.id} className="group flex flex-col bg-white rounded-[32px] border border-gray-100/80 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(64,29,143,0.1)] hover:-translate-y-1 transition-all duration-300">
          <div className="aspect-[4/3] bg-gray-50/50 relative overflow-hidden flex items-center justify-center p-6 group-hover:bg-brand-purple/5 transition-colors">
            <div className="w-full h-full absolute inset-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <span className="text-4xl">📦</span>
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white text-brand-dark shadow-sm border border-gray-100">
                {product.category ?? "Genel"}
              </span>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <button
                type="button"
                onClick={() => void toggleFavorite(product.id)}
                className="w-10 h-10 rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
                title={accessToken ? "Favorilere ekle / çıkar" : "Favoriler için giriş yapın"}
              >
                <Heart
                  size={18}
                  className={favoriteIds.includes(product.id) ? "text-red-500 fill-red-500" : ""}
                />
              </button>
              <button type="button" className="w-10 h-10 rounded-full bg-white text-gray-500 hover:text-brand-purple hover:bg-brand-purple/10 flex items-center justify-center shadow-sm border border-gray-100 transition-colors">
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
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isAdded
                    ? "bg-green-500 text-white scale-110"
                    : "bg-brand-dark text-white hover:bg-brand-purple group-hover:rotate-12"
                }`}
                title="Sepete Ekle"
              >
                {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
