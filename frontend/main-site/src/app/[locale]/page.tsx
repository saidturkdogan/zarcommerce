import {Link} from "../../i18n/routing";
import Image from "next/image";
import {useTranslations} from 'next-intl';
import ProductGrid from "./ProductGrid";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="relative block h-20 w-64">
              <Image 
                src="/logo.png" 
                alt="ZarCommerce Logo" 
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="#" className="text-brand-dark hover:text-brand-purple transition-colors">{t('campaigns')}</Link>
            <Link href="#" className="text-brand-dark hover:text-brand-purple transition-colors">{t('categories')}</Link>
            <Link href="#" className="text-brand-dark hover:text-brand-purple transition-colors">{t('foryou')}</Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
              <Link href="/" locale="tr" className="text-sm font-bold text-brand-dark hover:text-brand-purple">TR</Link>
              <span className="text-gray-300">|</span>
              <Link href="/" locale="en" className="text-sm font-bold text-brand-dark hover:text-brand-purple">EN</Link>
            </div>

            <button className="hidden md:block font-medium text-brand-dark hover:text-brand-purple transition-colors">
              {t('login')}
            </button>
            <button className="bg-brand-purple hover:bg-brand-purple-light text-white px-6 py-2.5 rounded-full font-semibold shadow-md shadow-brand-purple/20 transition-all hover:scale-105 active:scale-95">
              {t('register')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-brand-purple/5 blur-3xl mix-blend-multiply"></div>
            <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-yellow/10 blur-3xl mix-blend-multiply"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-brand-purple/10 mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-brand-yellow animate-pulse"></span>
              <span className="text-sm font-medium text-brand-purple">
                {t('slogan')}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark mb-6 tracking-tight max-w-4xl">
              {t.rich('title', {
                span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-purple-light">{chunks}</span>
              })}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-dark/70 mb-10 max-w-2xl">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl mx-auto relative">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full h-16 pl-8 pr-36 rounded-full border-2 border-gray-100 bg-white shadow-xl shadow-brand-dark/5 focus:border-brand-purple focus:outline-none transition-colors text-brand-dark text-lg"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-brand-yellow hover:bg-brand-yellow-light text-brand-dark font-bold px-8 rounded-full transition-colors text-lg">
                {t('searchButton')}
              </button>
            </div>
            
            {/* Quick Categories */}
            <div className="mt-16 flex flex-wrap justify-center gap-4">
              {['Elektronik', 'Moda', 'Ev & Yaşam', 'Kozmetik', 'Spor'].map((category) => (
                <button key={category} className="px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-purple/30 hover:-translate-y-1 transition-all text-brand-dark font-medium">
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Mockup Area */}
        <section className="py-24 bg-brand-gray/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-brand-dark">{t('dealsOfDay')}</h2>
              <Link href="#" className="text-brand-purple font-medium hover:underline">{t('seeAll')}</Link>
            </div>

            <ProductGrid />
          </div>
        </section>
      </main>
    </div>
  );
}
