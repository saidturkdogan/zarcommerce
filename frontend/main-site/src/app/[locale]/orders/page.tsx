'use client';

import { useEffect, useState } from 'react';
import { Link } from '../../../i18n/routing';
import { Package, Clock, CreditCard, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { PAYMENT_API_BASE, SESSION_JWT_KEY } from '../../../lib/api';

interface PaymentDetail {
  id: number;
  conversationId: string;
  price: number;
  paidPrice: number;
  currency: string;
  status: string;
  iyzicoPaymentId: string;
  buyerEmail: string;
  buyerName: string;
  createdAt: string;
  errorMessage: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_JWT_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    const storedUserStr = localStorage.getItem("zc_session_user");
    if (storedUserStr) {
      try {
        const user = JSON.parse(storedUserStr);
        if (user && user.email) {
          setUserEmail(user.email);
          fetchOrders(user.email);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (email: string) => {
    try {
      const res = await fetch(`${PAYMENT_API_BASE}/api/v1/payments/by-email?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!userEmail) {
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
            <h1 className="text-2xl font-extrabold text-brand-dark mb-3">Giriş Yapmanız Gerekiyor</h1>
            <p className="text-gray-500 mb-6">Siparişlerinizi görüntülemek için lütfen hesabınıza giriş yapın.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
              <ArrowLeft size={16} /> Ana Sayfaya Dön
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
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            Siparişlerim
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-brand-dark mb-8">Siparişlerim</h1>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-brand-dark mb-2">Henüz siparişiniz bulunmuyor</h2>
              <p className="text-gray-500 mb-6">Sipariş verdiğinizde detaylarını buradan takip edebilirsiniz.</p>
              <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-full font-semibold hover:bg-brand-purple-dark transition-colors">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isSuccess = order.status === 'SUCCESS';
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-50 bg-gray-50/50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-0.5">Sipariş No: <span className="font-semibold text-brand-dark">#{order.id}</span></p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:justify-end gap-3 sm:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Sipariş Tutarı</p>
                          <p className="font-extrabold text-brand-dark text-lg">{order.paidPrice.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isSuccess ? 'BAŞARILI' : 'BAŞARISIZ'}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard size={16} className="text-brand-purple" />
                        <span>Iyzico Ödeme ID: <span className="font-mono text-xs ml-1">{order.iyzicoPaymentId || '-'}</span></span>
                      </div>
                      <Link href={`/payment/result?status=${isSuccess ? 'success' : 'failure'}&paymentId=${order.id}`} className="text-brand-purple text-sm font-semibold hover:text-brand-purple-dark flex items-center gap-1 group">
                        Detayları Gör <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
