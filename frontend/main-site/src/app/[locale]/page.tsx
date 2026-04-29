import {Link} from "../../i18n/routing";
import Image from "next/image";
import {useTranslations} from 'next-intl';

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="group rounded-3xl border border-gray-100 overflow-hidden bg-white hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-300">
                  <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                    {/* Placeholder for product image */}
                    <div className="text-gray-300 group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2001/XMLSchema-instance" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1 rounded-full">
                      {t('discount')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-brand-dark mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors">
                      Premium Kablosuz Kulaklık Aktif Gürültü Engelleyici
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-brand-yellow text-sm">★★★★★</div>
                      <span className="text-xs text-brand-dark/50">(128)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-brand-dark/50 line-through">2.999 TL</span>
                        <div className="text-xl font-bold text-brand-purple">1.499 TL</div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-dark hover:bg-brand-purple hover:text-white transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
