'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '../../../../i18n/routing';
import { ShoppingBag, CreditCard, Shield, Lock, ChevronRight, Package, Minus, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

// Demo cart items for testing
const DEMO_CART_ITEMS = [
  { id: 'PROD-001', name: 'Apple MacBook Air M3', category1: 'Elektronik', category2: 'Bilgisayar', price: 42999.00, quantity: 1, image: '💻' },
  { id: 'PROD-002', name: 'Sony WH-1000XM5 Kulaklık', category1: 'Elektronik', category2: 'Ses Sistemleri', price: 8999.00, quantity: 1, image: '🎧' },
  { id: 'PROD-003', name: 'Nike Air Max 270', category1: 'Moda', category2: 'Ayakkabı', price: 3499.00, quantity: 2, image: '👟' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState(DEMO_CART_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const iframeRef = useRef<HTMLDivElement>(null);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = totalPrice >= 500 ? 0 : 49.90;
  const grandTotal = totalPrice + shippingCost;

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleInitializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build basket items from cart
      const basketItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2,
        itemType: 'PHYSICAL',
        price: (item.price * item.quantity).toFixed(2),
      }));

      const requestBody = {
        price: grandTotal.toFixed(2),
        paidPrice: grandTotal.toFixed(2),
        currency: 'TRY',
        installment: 1,
        basketId: 'BASKET-' + Date.now(),
        buyer: {
          id: 'BY789',
          name: 'Test',
          surname: 'Kullanici',
          email: 'test@zarcommerce.com',
          identityNumber: '74300864791',
          phoneNumber: '+905555555555',
          registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34742'
        },
        shippingAddress: {
          contactName: 'Test Kullanici',
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          zipCode: '34742'
        },
        billingAddress: {
          contactName: 'Test Kullanici',
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          zipCode: '34742'
        },
        basketItems,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/payments/checkout-form/initialize`, {
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
      setError('Bağlantı hatası: ' + (err.message || 'Sunucuya ulaşılamıyor.'));
    } finally {
      setLoading(false);
    }
  };

  // Inject iyzico checkout form HTML into the div
  useEffect(() => {
    if (checkoutFormHtml && iframeRef.current) {
      iframeRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.innerHTML = checkoutFormHtml;
      // Execute script tags
      const scripts = div.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
      iframeRef.current.appendChild(div);
    }
  }, [checkoutFormHtml]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-brand-dark hover:text-brand-purple transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xl font-extrabold tracking-tight">
              Zar<span className="text-brand-purple">Commerce</span>
            </span>
          </Link>

          {/* Steps */}
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${step === 'cart' ? 'bg-brand-purple text-white' : 'bg-brand-purple/10 text-brand-purple'}`}>
              <ShoppingBag size={14} />
              <span>Sepet</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${step === 'payment' ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
              <CreditCard size={14} />
              <span>Ödeme</span>
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
          /* ===== CART STEP ===== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl font-extrabold text-brand-dark mb-6">
                Sepetim <span className="text-gray-400 text-lg font-medium">({cartItems.reduce((s, i) => s + i.quantity, 0)} ürün)</span>
              </h1>

              {cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Sepetiniz boş</p>
                  <Link href="/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
                    <ArrowLeft size={16} />
                    Alışverişe Devam Et
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
                    {/* Product Emoji/Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl shrink-0 group-hover:bg-brand-purple/5 transition-colors">
                      {item.image}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark truncate">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{item.category1} / {item.category2}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-brand-dark">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0 w-28">
                      <p className="font-extrabold text-brand-dark text-lg">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">{item.price.toLocaleString('tr-TR')} ₺ / adet</p>
                      )}
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-extrabold text-brand-dark mb-5">Sipariş Özeti</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Ürünler Toplamı</span>
                    <span className="font-semibold text-brand-dark">{totalPrice.toLocaleString('tr-TR')} ₺</span>
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
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleInitializePayment}
                  disabled={loading || cartItems.length === 0}
                  className="w-full mt-6 h-14 bg-gradient-to-r from-brand-purple to-brand-purple-light hover:from-brand-purple-dark hover:to-brand-purple text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-purple/25 hover:shadow-xl hover:shadow-brand-purple/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Ödemeye Geç
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Shield size={14} className="text-green-400" />
                    <span>iyzico ile güvenli</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock size={14} className="text-green-400" />
                    <span>256-bit SSL</span>
                  </div>
                </div>

                {/* Test Card Info */}
                <div className="mt-6 p-4 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
                  <p className="text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
                    🧪 Sandbox Test Kartları
                  </p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-mono">5528 7900 0000 0008</span>
                      <span className="text-gray-400">Halkbank MC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">5526 0800 0000 0006</span>
                      <span className="text-gray-400">Akbank MC</span>
                    </div>
                    <div className="text-gray-400 mt-1">SKT: 12/2030 • CVV: 123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===== PAYMENT STEP ===== */
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setStep('cart'); setCheckoutFormHtml(null); }}
                className="p-2 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/5 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-extrabold text-brand-dark">Ödeme</h1>
            </div>

            {/* Order Summary Mini */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Toplam: <span className="font-extrabold text-brand-dark text-lg ml-1">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <Shield size={12} />
                  <span className="font-semibold">iyzico Korumalı Ödeme</span>
                </div>
              </div>
            </div>

            {/* iyzico Checkout Form Container */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
              <div ref={iframeRef} id="iyzipay-checkout-form" className="w-full" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
