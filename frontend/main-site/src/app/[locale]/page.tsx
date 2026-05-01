import {Link} from "../../i18n/routing";
import Image from "next/image";
import {useTranslations} from 'next-intl';
import ProductGrid from "./ProductGrid";
import { Search, ShoppingBag, User, Heart, Menu, ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-dark bg-gray-50">
      {/* Top Banner */}
      <div className="bg-brand-dark text-white text-sm py-2 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <Zap size={14} className="text-brand-yellow" />
          Yaz İndirimleri Başladı! Seçili ürünlerde %50'ye varan indirimleri kaçırmayın.
          <Link href="#" className="font-bold underline ml-2 hover:text-brand-yellow transition-colors">Hemen İncele</Link>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm transition-all">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={24} />
            </button>
            {/* Logo */}
            <Link href="/" className="relative block h-10 w-48 group">
              <span className="text-2xl font-extrabold text-brand-dark tracking-tight flex items-center gap-1">
                Zar<span className="text-brand-purple">Commerce</span>
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-medium">
            <Link href="#" className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t('campaigns')}</Link>
            <Link href="#" className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t('categories')}</Link>
            <Link href="#" className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t('foryou')}</Link>
          </nav>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200">
              <Link href="/" locale="tr" className="text-xs font-bold text-brand-dark hover:text-brand-purple transition-colors">TR</Link>
              <span className="text-gray-300">|</span>
              <Link href="/" locale="en" className="text-xs font-bold text-gray-500 hover:text-brand-purple transition-colors">EN</Link>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 text-brand-dark hover:bg-brand-purple/10 hover:text-brand-purple rounded-full transition-all">
                <User size={20} />
              </button>
              <button className="p-2.5 text-brand-dark hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all relative">
                <Heart size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2.5 text-brand-dark hover:bg-brand-purple/10 hover:text-brand-purple rounded-full transition-all relative">
                <ShoppingBag size={20} />
                <span className="absolute top-0 right-0 bg-brand-yellow text-brand-dark text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">3</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 lg:px-8">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-brand-purple/10 to-transparent blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-yellow/10 to-transparent blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-brand-purple/15 mb-8 transform hover:scale-105 transition-transform cursor-pointer">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-purple animate-pulse"></span>
              <span className="text-sm font-semibold text-brand-purple tracking-wide">
                {t('slogan')}
              </span>
              <ArrowRight size={14} className="text-brand-purple ml-1" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 tracking-tight leading-tight">
              {t.rich('title', {
                span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-purple-light to-indigo-500 drop-shadow-sm">{chunks}</span>
              })}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-dark/60 mb-12 max-w-2xl font-medium leading-relaxed">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-3xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-yellow/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
              <div className="relative w-full flex items-center">
                <Search className="absolute left-6 text-gray-400 z-10" size={24} />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full h-16 sm:h-20 pl-16 pr-36 sm:pr-48 rounded-full border border-gray-200 bg-white/90 backdrop-blur-md shadow-xl focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 focus:outline-none transition-all text-brand-dark text-lg placeholder:text-gray-400"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-brand-dark hover:bg-brand-purple text-white font-semibold px-6 sm:px-10 rounded-full transition-colors text-base sm:text-lg flex items-center gap-2 shadow-md">
                  <Search size={20} className="hidden sm:block" />
                  {t('searchButton')}
                </button>
              </div>
            </div>
            
            {/* Quick Categories & Features */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              {['Elektronik', 'Moda', 'Ev & Yaşam', 'Kozmetik', 'Spor'].map((category) => (
                <button key={category} className="px-5 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-semibold text-brand-dark/70 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all">
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features Banner */}
        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 bg-brand-yellow/10 text-brand-yellow rounded-full flex items-center justify-center mb-3">
                  <Truck size={24} />
                </div>
                <h3 className="font-bold text-brand-dark">Ücretsiz Kargo</h3>
                <p className="text-sm text-gray-500 mt-1">500 TL üzeri tüm alışverişlerde</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-brand-dark">Güvenli Ödeme</h3>
                <p className="text-sm text-gray-500 mt-1">256-bit SSL şifreleme ile koruma</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                  <Zap size={24} />
                </div>
                <h3 className="font-bold text-brand-dark">Hızlı Teslimat</h3>
                <p className="text-sm text-gray-500 mt-1">Aynı gün kargoya teslim seçeneği</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Area */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">{t('dealsOfDay')}</h2>
                <p className="text-gray-500 mt-2 font-medium">Seçili ürünlerde sınırlı süreli teklifleri keşfet</p>
              </div>
              <Link href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-brand-dark font-semibold hover:border-brand-purple hover:text-brand-purple transition-all hover:shadow-sm">
                {t('seeAll')}
                <ArrowRight size={18} />
              </Link>
            </div>

            <ProductGrid />
          </div>
        </section>
      </main>
      
      <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-brand-purple/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-extrabold tracking-tight flex items-center gap-1 mb-6">
                Zar<span className="text-brand-yellow">Commerce</span>
              </span>
              <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
                Modern alışverişin yeni adresi. Aradığınız her şey, en uygun fiyatlar ve güvenilir teslimat ile kapınızda.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 ZarCommerce. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="#" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
