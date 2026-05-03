'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '../../../i18n/routing';
import { ArrowRight, Monitor, Shirt, Home, Sparkles, Dumbbell } from 'lucide-react';
import ProductGrid from '../ProductGrid';
import { SESSION_JWT_KEY } from '../../../lib/api';

const CATEGORIES = [
  { id: 'elektronik', name: 'Elektronik', icon: Monitor, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'moda', name: 'Moda', icon: Shirt, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { id: 'ev-yasam', name: 'Ev & Yaşam', icon: Home, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'kozmetik', name: 'Kozmetik', icon: Sparkles, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'spor', name: 'Spor', icon: Dumbbell, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
];

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_JWT_KEY);
    if (!token) return;
    setAccessToken(token);
  }, []);

  const normalizedSelectedCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return selectedCategory.toLocaleLowerCase('tr-TR');
  }, [selectedCategory]);

  const handleSessionExpired = () => {
    localStorage.removeItem(SESSION_JWT_KEY);
    localStorage.removeItem('zc_session_user');
    setAccessToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="relative flex items-center h-12 md:h-16 group">
            <img src="/logo.png" alt="ZarCommerce" className="h-10 md:h-14 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-brand-purple transition-colors">
              Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight mb-4">
              Kategorileri Keşfet
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              ZarCommerce'de aradığınız her şeyi kolayca bulun. İlginizi çeken kategoriyi seçin ve alışverişe başlayın.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories?category=${encodeURIComponent(category.name)}`}
                className="group bg-white rounded-[32px] border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon size={32} />
                </div>
                <h2 className="text-xl font-bold text-brand-dark mb-2 group-hover:text-brand-purple transition-colors">
                  {category.name}
                </h2>
                <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-brand-purple transition-colors">
                  Ürünleri Gör <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {normalizedSelectedCategory && (
            <div className="mt-14">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-brand-dark">
                  {selectedCategory} kategorisi
                </h2>
                <Link href="/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-brand-dark font-semibold hover:border-brand-purple hover:text-brand-purple transition-all hover:shadow-sm">
                  Kategori secimini temizle
                </Link>
              </div>
              <ProductGrid
                accessToken={accessToken}
                onRequireLogin={() => undefined}
                onSessionExpired={handleSessionExpired}
                selectedCategory={selectedCategory}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white pt-20 pb-10 border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/95 px-3 py-2">
              <img src="/logo.png" alt="ZarCommerce" className="h-14 md:h-16 w-auto object-contain" />
            </div>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              Modern alışverişin yeni adresi. Aradığınız her şey, en uygun fiyatlar ve güvenilir teslimat ile kapınızda.
            </p>
          </div>
          <div className="pt-8 border-t border-gray-800 flex items-center justify-center text-gray-500 text-sm">
            <p>&copy; 2026 ZarCommerce. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
