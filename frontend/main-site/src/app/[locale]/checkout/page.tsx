'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '../../../i18n/routing';
import { ShoppingBag, CreditCard, Shield, Lock, ChevronRight, Package, Minus, Plus, Trash2, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { useCart } from '../../../lib/cart';
import { SESSION_JWT_KEY, USER_API_BASE } from '../../../lib/api';

const ORDER_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

type SessionUser = { userId: number; email: string; firstName: string; lastName: string };

export default function CheckoutPage() {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const iframeRef = useRef<HTMLDivElement>(null);

  const shippingCost = cart.totalPrice >= 500 ? 0 : 49.90;
  const grandTotal = cart.totalPrice + shippingCost;

  // Check auth on mount
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_JWT_KEY);
    if (!token) { setAuthChecked(true); return; }

    const storedUserStr = sessionStorage.getItem("zc_session_user");
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser && storedUser.userId) {
          setUser({ 
            userId: storedUser.userId, 
            email: storedUser.email, 
            firstName: storedUser.firstName, 
            lastName: storedUser.lastName 
          });
          setAuthChecked(true);
          return;
        }
      } catch { /* ignore */ }
    }

    (async () => {
      try {
        const res = await fetch(`${USER_API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const p = await res.json();
          setUser({ userId: p.userId, email: p.email, firstName: p.firstName, lastName: p.lastName });
        }
      } catch { /* ignore */ }
      setAuthChecked(true);
    })();
  }, []);

  const handleInitializePayment = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const basketItems = cart.items.map(item => ({
        id: `PROD-${item.productId}`,
        name: item.name,
        category1: item.category || 'Genel',
        category2: item.category || 'Genel',
        itemType: 'PHYSICAL',
        price: (item.price * item.quantity).toFixed(2),
      }));

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Kullanıcı';
      const requestBody = {
        price: grandTotal.toFixed(2),
        paidPrice: grandTotal.toFixed(2),
        currency: 'TRY',
        installment: 1,
        basketId: 'BASKET-' + Date.now(),
        buyer: {
          id: `BY${user.userId}`,
          name: user.firstName || 'Test',
          surname: user.lastName || 'Kullanıcı',
          email: user.email,
          identityNumber: '74300864791',
          phoneNumber: '+905555555555',
          registrationAddress: 'Istanbul, Turkey',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34742'
        },
        shippingAddress: { contactName: fullName, city: 'Istanbul', country: 'Turkey', address: 'Istanbul, Turkey', zipCode: '34742' },
        billingAddress: { contactName: fullName, city: 'Istanbul', country: 'Turkey', address: 'Istanbul, Turkey', zipCode: '34742' },
        basketItems,
      };

      const response = await fetch(`${ORDER_API_BASE}/api/v1/payments/checkout-form/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (data.status === 'success' && data.checkoutFormContent) {
        setCheckoutFormHtml(data.checkoutFormContent);
        setStep('payment');
      } else {
        setError(data.errorMessage || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setError('Baglanti hatasi: ' + (err.message || 'Sunucuya ulasilamiyor.'));
    } finally {
      setLoading(false);
    }
  };

  // Inject iyzico checkout form HTML
  useEffect(() => {
    if (checkoutFormHtml && iframeRef.current) {
      iframeRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.innerHTML = checkoutFormHtml;
      const scripts = div.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        if (script.src) { newScript.src = script.src; } else { newScript.textContent = script.textContent; }
        document.head.appendChild(newScript);
      });
      iframeRef.current.appendChild(div);
    }
  }, [checkoutFormHtml]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="text-brand-purple animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
              <ArrowLeft size={20} />
              <span className="text-xl font-extrabold tracking-tight">Zar<span className="text-brand-purple">Commerce</span></span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-lg p-10 text-center">
            <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <LogIn size={28} className="text-brand-purple" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-dark mb-3">Giriş Yapmanız Gerekiyor</h1>
            <p className="text-gray-500 mb-6">Ödeme yapabilmek için lütfen hesabınıza giriş yapın.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
              <ArrowLeft size={16} /> Ana Sayfaya Dön ve Giriş Yap
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xl font-extrabold tracking-tight">Zar<span className="text-brand-purple">Commerce</span></span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${step === 'cart' ? 'bg-brand-purple text-white' : 'bg-brand-purple/10 text-brand-purple'}`}>
              <ShoppingBag size={14} /><span>Sepet</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${step === 'payment' ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
              <CreditCard size={14} /><span>Ödeme</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock size={14} className="text-green-500" />
            <span className="hidden sm:inline">Güvenli Ödeme</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {step === 'cart' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl font-extrabold text-brand-dark mb-6">
                Sepetim <span className="text-gray-400 text-lg font-medium">({cart.totalCount} ürün)</span>
              </h1>
              {cart.items.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Sepetiniz boş</p>
                  <Link href="/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
                    <ArrowLeft size={16} /> Alışverişe Devam Et
                  </Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.productId} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl shrink-0 group-hover:bg-brand-purple/5 transition-colors overflow-hidden">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark truncate">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{item.category || 'Genel'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Minus size={14} /></button>
                      <span className="w-10 text-center font-bold text-brand-dark">{item.quantity}</span>
                      <button onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="text-right shrink-0 w-28">
                      <p className="font-extrabold text-brand-dark text-lg">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-400">{item.price.toLocaleString('tr-TR')} ₺ / adet</p>}
                    </div>
                    <button onClick={() => cart.removeItem(item.productId)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-extrabold text-brand-dark mb-5">Sipariş Özeti</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Ürünler Toplamı</span>
                    <span className="font-semibold text-brand-dark">{cart.totalPrice.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-green-500' : 'text-brand-dark'}`}>
                      {shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold text-brand-dark text-base">Toplam</span>
                    <span className="font-extrabold text-brand-dark text-xl">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
                )}

                <button
                  onClick={handleInitializePayment}
                  disabled={loading || cart.items.length === 0}
                  className="w-full mt-6 h-14 bg-gradient-to-r from-brand-purple to-brand-purple-light hover:from-brand-purple-dark hover:to-brand-purple text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-purple/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (<><Loader2 size={20} className="animate-spin" /> İşleniyor...</>) : (<><CreditCard size={20} /> Ödemeye Geç</>)}
                </button>

                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Shield size={14} className="text-green-400" /><span>iyzico ile güvenli</span></div>
                  <div className="flex items-center gap-1"><Lock size={14} className="text-green-400" /><span>256-bit SSL</span></div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
                  <p className="text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">🧪 Sandbox Test Kartları</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between"><span className="font-mono">5528 7900 0000 0008</span><span className="text-gray-400">Halkbank MC</span></div>
                    <div className="flex justify-between"><span className="font-mono">5526 0800 0000 0006</span><span className="text-gray-400">Akbank MC</span></div>
                    <div className="text-gray-400 mt-1">SKT: 12/2030 • CVV: 123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setStep('cart'); setCheckoutFormHtml(null); }} className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-all">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-extrabold text-brand-dark">Ödeme</h1>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Toplam: <span className="font-extrabold text-brand-dark text-lg ml-1">{grandTotal.toLocaleString('tr-TR')} ₺</span></div>
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full"><Shield size={12} /><span className="font-semibold">iyzico Korumalı Ödeme</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
              <div ref={iframeRef} id="iyzipay-checkout-form" className="w-full" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
