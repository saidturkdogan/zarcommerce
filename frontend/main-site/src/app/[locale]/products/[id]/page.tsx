'use client';

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, Loader2, ShoppingCart, Star, X, Minus, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "../../../../i18n/routing";
import { PRODUCT_API_BASE, SESSION_JWT_KEY, USER_API_BASE } from "../../../../lib/api";
import { useCart } from "../../../../lib/cart";

type ProductDetail = {
  id: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  description: string | null;
  price: number;
  category: string | null;
  brand: string | null;
  currency: string;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cart = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const productId = useMemo(() => Number.parseInt(params.id ?? "", 10), [params.id]);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_JWT_KEY);
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setError("Gecersiz urun id.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${PRODUCT_API_BASE}/api/v1/products/${productId}`);
        if (!res.ok) {
          throw new Error(`Urun bulunamadi (${res.status})`);
        }
        const data = (await res.json()) as ProductDetail;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Urun yuklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  useEffect(() => {
    if (!accessToken || !Number.isFinite(productId)) return;
    (async () => {
      try {
        const res = await fetch(`${USER_API_BASE}/api/v1/wishlist/product-ids`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const ids = (await res.json()) as number[];
        setIsFavorite(ids.includes(productId));
      } catch {
        /* ignore */
      }
    })();
  }, [accessToken, productId]);

  const toggleFavorite = async () => {
    if (!accessToken) {
      setFavoriteError("Begeni icin once giris yapin.");
      return;
    }
    if (!product) return;
    setFavoriteBusy(true);
    setFavoriteError(null);
    const method = isFavorite ? "DELETE" : "POST";
    try {
      const res = await fetch(`${USER_API_BASE}/api/v1/wishlist/products/${product.id}`, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error(`Begeni guncellenemedi (${res.status})`);
      }
      setIsFavorite((prev) => !prev);
    } catch (err) {
      setFavoriteError(err instanceof Error ? err.message : "Begeni guncellenemedi.");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const alreadyInCart = cart.items.some((item) => item.productId === product.id);
    if (!alreadyInCart) {
      cart.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
      });
    }
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-brand-purple animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
              <ArrowLeft size={20} />
              Ana sayfaya don
            </Link>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-red-600 font-semibold">{error ?? "Urun bulunamadi."}</p>
          </div>
        </main>
      </div>
    );
  }

  const isInCart = cart.items.some((item) => item.productId === product.id);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
            <ArrowLeft size={20} />
            Ana sayfa
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/favorites" className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
              <Heart size={16} className="fill-current" />
              Begenilerim
            </Link>
            <button onClick={() => setCartOpen(true)} className="p-2.5 text-brand-dark hover:bg-brand-purple/10 hover:text-brand-purple rounded-full transition-all relative">
              <ShoppingCart size={20} />
              {cart.totalCount > 0 && <span className="absolute top-0 right-0 bg-brand-yellow text-brand-dark text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cart.totalCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-gray-100 rounded-[32px] p-6 lg:p-10 shadow-sm">
          <div className="rounded-3xl bg-gray-50 overflow-hidden aspect-square">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple">
                {product.category ?? "Genel"}
              </span>
              {product.brand && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-brand-dark mb-4">{product.name}</h1>

            <div className="flex items-center gap-1 mb-4 text-brand-yellow">
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current" />
              <Star size={16} className="fill-current text-gray-300" />
              <span className="text-sm text-gray-400 ml-2">(4.0)</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description || "Bu urun icin henuz detayli aciklama eklenmedi."}
            </p>

            <div className="mb-8">
              <span className="text-4xl font-black text-brand-dark">
                {product.price.toLocaleString("tr-TR")}{" "}
                <span className="text-base text-brand-purple font-bold">{product.currency ?? "TL"}</span>
              </span>
            </div>

            {favoriteError && (
              <p className="mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {favoriteError}
              </p>
            )}

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold transition-colors ${
                  isInCart ? "bg-green-600 hover:bg-green-700" : "bg-brand-dark hover:bg-brand-purple"
                }`}
              >
                <ShoppingCart size={18} />
                {isInCart ? "Sepette" : "Sepete ekle"}
              </button>
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                disabled={favoriteBusy}
                className={`h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-colors ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-600 hover:text-red-500 hover:border-red-200"
                }`}
              >
                <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                {isFavorite ? "Begenilerde" : "Begen"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-brand-dark text-white pt-12 pb-8 border-t border-brand-purple/20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <img src="/logo.png" alt="ZarCommerce" className="h-14 md:h-16 w-auto object-contain mx-auto mb-4" />
          <p className="text-sm text-gray-400">© 2026 ZarCommerce. Tum haklari saklidir.</p>
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-brand-dark">Sepetim ({cart.totalCount})</h2>
              <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.items.length === 0 ? (
                <div className="text-center py-16"><ShoppingCart size={48} className="mx-auto text-gray-200 mb-4"/><p className="text-gray-400">Sepetiniz bos</p></div>
              ) : cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg"/> : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark text-sm truncate">{item.name}</p>
                    <p className="text-brand-purple font-bold text-sm">{(item.price * item.quantity).toLocaleString("tr-TR")} TL</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus size={12}/></button>
                    <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus size={12}/></button>
                  </div>
                  <button onClick={() => cart.removeItem(item.productId)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            {cart.items.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-3">
                <div className="flex justify-between font-bold text-brand-dark"><span>Toplam</span><span>{cart.totalPrice.toLocaleString("tr-TR")} TL</span></div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    if (accessToken) {
                      router.push("/checkout");
                    } else {
                      router.push("/");
                    }
                  }}
                  className="block w-full h-12 bg-brand-purple text-white font-semibold rounded-xl hover:bg-brand-purple-dark transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18}/> Sepeti Onayla
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
