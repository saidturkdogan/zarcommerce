"use client";

import { Link, useRouter } from "../../i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import ProductGrid from "./ProductGrid";
import { useCallback, useEffect, useState, useRef } from "react";
import { Search, ShoppingBag, Heart, Menu, ArrowRight, Zap, ShieldCheck, Truck, X, Minus, Plus, Trash2 } from "lucide-react";
import { SESSION_JWT_KEY, USER_API_BASE } from "../../lib/api";
import { useCart } from "../../lib/cart";

type SessionUser = {
  userId: number;
  email: string;
  displayName: string;
};

type CustomerAuthResponse = {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

type CustomerProfileResponse = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

function displayNameFromProfile(p: { firstName: string; lastName: string; email: string }) {
  const n = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return n || p.email;
}

async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) return body.message;
  } catch {
    /* ignore */
  }
  return response.statusText || "İstek başarısız";
}

export default function Home() {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({ name: "", email: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCart();
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_JWT_KEY) : null;
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${USER_API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          sessionStorage.removeItem(SESSION_JWT_KEY);
          return;
        }
        const profile = (await res.json()) as CustomerProfileResponse;
        setAccessToken(token);
        setSessionUser({
          userId: profile.userId,
          email: profile.email,
          displayName: displayNameFromProfile(profile),
        });
        sessionStorage.setItem("zc_session_user", JSON.stringify(profile));
      } catch {
        sessionStorage.removeItem(SESSION_JWT_KEY);
      }
    })();
  }, []);

  const openAuthModal = useCallback((mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthError(null);
    setFormValues({ name: "", email: "", password: "" });
    setAuthModalOpen(true);
  }, []);

  const applyAuthSuccess = (data: CustomerAuthResponse) => {
    sessionStorage.setItem(SESSION_JWT_KEY, data.token);
    setAccessToken(data.token);
    setSessionUser({
      userId: data.userId,
      email: data.email,
      displayName: displayNameFromProfile(data),
    });
    sessionStorage.setItem("zc_session_user", JSON.stringify({
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    }));
    setAuthModalOpen(false);
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const email = formValues.email.trim().toLowerCase();
    const password = formValues.password;
    const name = formValues.name.trim();

    if (!email || !password || (authMode === "register" && !name)) {
      setAuthError(tAuth("missingFieldsError"));
      return;
    }

    try {
      if (authMode === "register") {
        const parts = name.split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ");
        const res = await fetch(`${USER_API_BASE}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
        if (!res.ok) {
          setAuthError(await readApiError(res));
          return;
        }
        const data = (await res.json()) as CustomerAuthResponse;
        applyAuthSuccess(data);
        return;
      }

      const res = await fetch(`${USER_API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setAuthError(await readApiError(res));
        return;
      }
      const data = (await res.json()) as CustomerAuthResponse;
      applyAuthSuccess(data);
    } catch {
      setAuthError(tAuth("connectionError"));
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_JWT_KEY);
    sessionStorage.removeItem("zc_session_user");
    setAccessToken(null);
    setSessionUser(null);
  };

  const handleSessionExpired = useCallback(() => {
    sessionStorage.removeItem(SESSION_JWT_KEY);
    setAccessToken(null);
    setSessionUser(null);
    openAuthModal("login");
  }, [openAuthModal]);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(searchQuery);
    setSelectedCategory(null);
    scrollToProducts();
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
    setActiveSearch("");
    setSearchQuery("");
    scrollToProducts();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-dark bg-gray-50">
      <div className="bg-brand-dark text-white text-sm py-2 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <Zap size={14} className="text-brand-yellow" />
          Yaz İndirimleri Başladı! Seçili ürünlerde %50'ye varan indirimleri kaçırmayın.
          <button onClick={scrollToProducts} className="font-bold underline ml-2 hover:text-brand-yellow transition-colors">Hemen İncele</button>
        </span>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm transition-all">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <Link href="/" className="relative block h-10 w-48 group">
              <span className="text-2xl font-extrabold text-brand-dark tracking-tight flex items-center gap-1">
                Zar<span className="text-brand-purple">Commerce</span>
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-medium">
            <button onClick={scrollToProducts} className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t("campaigns")}</button>
            <button onClick={scrollToProducts} className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t("categories")}</button>
            <button onClick={scrollToProducts} className="text-brand-dark/80 hover:text-brand-purple transition-all hover:-translate-y-0.5">{t("foryou")}</button>
          </nav>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden sm:flex items-center p-1 bg-gray-100/80 rounded-full border border-gray-200/60 shadow-inner">
              <Link href="/" locale="tr" className={`px-4 py-1 text-xs font-bold rounded-full transition-all duration-300 ${locale === 'tr' ? 'bg-white text-brand-purple shadow-sm scale-100' : 'text-gray-400 hover:text-brand-dark scale-95'}`}>TR</Link>
              <Link href="/" locale="en" className={`px-4 py-1 text-xs font-bold rounded-full transition-all duration-300 ${locale === 'en' ? 'bg-white text-brand-purple shadow-sm scale-100' : 'text-gray-400 hover:text-brand-dark scale-95'}`}>EN</Link>
            </div>

            <div className="flex items-center gap-2">
              {sessionUser ? (
                <>
                  <span className="hidden md:inline-flex items-center h-10 px-4 rounded-full bg-brand-purple/10 text-brand-purple font-semibold text-sm">
                    {sessionUser.displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="h-10 px-4 text-sm font-semibold text-brand-dark rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="h-10 px-4 text-sm font-semibold text-brand-dark rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {t("login")}
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="h-10 px-4 text-sm font-semibold text-white bg-brand-purple rounded-full hover:bg-brand-purple-dark transition-colors"
                  >
                    {t("register")}
                  </button>
                </>
              )}
              <button onClick={() => { if (!accessToken) { openAuthModal("login"); } else { scrollToProducts(); }}} className="p-2.5 text-brand-dark hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all relative">
                <Heart size={20} />
              </button>
              <button onClick={() => setCartOpen(true)} className="p-2.5 text-brand-dark hover:bg-brand-purple/10 hover:text-brand-purple rounded-full transition-all relative">
                <ShoppingBag size={20} />
                {cart.totalCount > 0 && <span className="absolute top-0 right-0 bg-brand-yellow text-brand-dark text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cart.totalCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 lg:px-8">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-brand-purple/10 to-transparent blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-yellow/10 to-transparent blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10 flex flex-col items-center text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-brand-purple/15 mb-8 transform hover:scale-105 transition-transform cursor-pointer">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-purple animate-pulse"></span>
              <span className="text-sm font-semibold text-brand-purple tracking-wide">{t("slogan")}</span>
              <ArrowRight size={14} className="text-brand-purple ml-1" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 tracking-tight leading-tight">
              {t.rich("title", {
                span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-purple-light to-indigo-500 drop-shadow-sm">{chunks}</span>
              })}
            </h1>

            <p className="text-lg md:text-xl text-brand-dark/60 mb-12 max-w-2xl font-medium leading-relaxed">
              {t("subtitle")}
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-3xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-yellow/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
              <div className="relative w-full flex items-center">
                <Search className="absolute left-6 text-gray-400 z-10" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full h-16 sm:h-20 pl-16 pr-36 sm:pr-48 rounded-full border border-gray-200 bg-white/90 backdrop-blur-md shadow-xl focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 focus:outline-none transition-all text-brand-dark text-lg placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-brand-dark hover:bg-brand-purple text-white font-semibold px-6 sm:px-10 rounded-full transition-colors text-base sm:text-lg flex items-center gap-2 shadow-md">
                  <Search size={20} className="hidden sm:block" />
                  {t("searchButton")}
                </button>
              </div>
            </form>

            <div className="mt-16 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              {["Elektronik", "Moda", "Ev & Yaşam", "Kozmetik", "Spor"].map((category) => (
                <button key={category} onClick={() => handleCategoryClick(category)} className={`px-5 py-2.5 backdrop-blur-sm border rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  selectedCategory === category
                    ? "bg-brand-purple text-white border-brand-purple shadow-lg"
                    : "bg-white/60 border-gray-200 text-brand-dark/70 hover:text-brand-purple hover:border-brand-purple/30 hover:bg-white hover:shadow-md"
                }`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

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

        <section ref={productsRef} className="py-20 lg:py-28 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">{t("dealsOfDay")}</h2>
                <p className="text-gray-500 mt-2 font-medium">
                  {activeSearch ? `"${activeSearch}" için sonuçlar` : selectedCategory ? `${selectedCategory} kategorisi` : "Seçili ürünlerde sınırlı süreli teklifleri keşfet"}
                </p>
              </div>
              {(activeSearch || selectedCategory) && (
                <button onClick={() => { setActiveSearch(""); setSearchQuery(""); setSelectedCategory(null); }} className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-brand-dark font-semibold hover:border-brand-purple hover:text-brand-purple transition-all hover:shadow-sm">
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <ProductGrid
              accessToken={accessToken}
              onRequireLogin={() => openAuthModal("login")}
              onSessionExpired={handleSessionExpired}
              searchQuery={activeSearch}
              selectedCategory={selectedCategory}
            />
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

      {authModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-extrabold text-brand-dark">{authMode === "login" ? tAuth("loginButton") : tAuth("registerButton")}</h2>
              <button onClick={() => setAuthModalOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500">
                X
              </button>
            </div>

            <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${authMode === "login" ? "bg-white text-brand-dark shadow-sm" : "text-gray-500"}`}
              >
                {t("login")}
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${authMode === "register" ? "bg-white text-brand-dark shadow-sm" : "text-gray-500"}`}
              >
                {t("register")}
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder={tAuth("namePlaceholder")}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all"
                />
              )}
              <input
                type="email"
                value={formValues.email}
                onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                placeholder={tAuth("emailPlaceholder")}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all"
              />
              <input
                type="password"
                value={formValues.password}
                onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))}
                placeholder={tAuth("passwordPlaceholder")}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all"
              />

              {authError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {authError}
                </p>
              )}

              <button type="submit" className="w-full h-12 rounded-xl bg-brand-purple text-white font-semibold hover:bg-brand-purple-dark transition-colors shadow-lg shadow-brand-purple/20">
                {authMode === "login" ? tAuth("loginButton") : tAuth("registerButton")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
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
                <div className="text-center py-16"><ShoppingBag size={48} className="mx-auto text-gray-200 mb-4"/><p className="text-gray-400">Sepetiniz boş</p></div>
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
                      openAuthModal("login");
                    }
                  }} 
                  className="block w-full h-12 bg-brand-purple text-white font-semibold rounded-xl hover:bg-brand-purple-dark transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18}/> Sepeti Onayla
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-72 bg-white shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="text-xl font-extrabold text-brand-dark">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={20}/></button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              <button onClick={() => { scrollToProducts(); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-brand-dark">{t("campaigns")}</button>
              <button onClick={() => { scrollToProducts(); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-brand-dark">{t("categories")}</button>
              <button onClick={() => { scrollToProducts(); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-brand-dark">{t("foryou")}</button>
              <div className="border-t border-gray-100 my-2"></div>
              <div className="flex gap-2 px-4">
                <Link href="/" locale="tr" className="px-4 py-2 rounded-full bg-gray-100 text-sm font-bold">TR</Link>
                <Link href="/" locale="en" className="px-4 py-2 rounded-full bg-gray-100 text-sm font-bold">EN</Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
