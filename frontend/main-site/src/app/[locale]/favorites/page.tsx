'use client';

import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Link } from "../../../i18n/routing";
import { SESSION_JWT_KEY, USER_API_BASE } from "../../../lib/api";
import ProductGrid from "../ProductGrid";

type CustomerProfileResponse = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

export default function FavoritesPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_JWT_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${USER_API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem(SESSION_JWT_KEY);
          localStorage.removeItem("zc_session_user");
          setLoading(false);
          return;
        }
        const profile = (await res.json()) as CustomerProfileResponse;
        localStorage.setItem("zc_session_user", JSON.stringify(profile));
        setAccessToken(token);
      } catch {
        localStorage.removeItem(SESSION_JWT_KEY);
        localStorage.removeItem("zc_session_user");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSessionExpired = () => {
    localStorage.removeItem(SESSION_JWT_KEY);
    localStorage.removeItem("zc_session_user");
    setAccessToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
              <ArrowLeft size={20} />
              <img src="/logo.png" alt="ZarCommerce" className="h-10 md:h-12 w-auto object-contain" />
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-lg p-10 text-center">
            <h1 className="text-2xl font-extrabold text-brand-dark mb-3">Giris yapmaniz gerekiyor</h1>
            <p className="text-gray-500 mb-6">Begeni listenizi gormek icin once hesabiniza giris yapin.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
              <ArrowLeft size={16} /> Ana sayfaya don
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="ZarCommerce" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
            <Heart size={16} className="fill-current" />
            Begenilerim
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8">Begenilen urunler</h1>
        <ProductGrid
          accessToken={accessToken}
          onRequireLogin={() => undefined}
          onSessionExpired={handleSessionExpired}
          showFavoritesOnly
        />
      </main>

      <footer className="bg-brand-dark text-white pt-12 pb-8 border-t border-brand-purple/20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <img src="/logo.png" alt="ZarCommerce" className="h-14 md:h-16 w-auto object-contain mx-auto mb-4" />
          <p className="text-sm text-gray-400">© 2026 ZarCommerce. Tum haklari saklidir.</p>
        </div>
      </footer>
    </div>
  );
}
