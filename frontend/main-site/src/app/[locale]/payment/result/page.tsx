'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Link } from '../../../../i18n/routing';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowLeft, Package, CreditCard, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

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

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const paymentId = searchParams.get('paymentId');
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetch(`${API_BASE_URL}/api/v1/payments/${paymentId}`)
        .then(res => res.json())
        .then(data => {
          setPayment(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="ZarCommerce" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-12 text-center">
              <Loader2 size={48} className="mx-auto text-brand-purple animate-spin mb-4" />
              <p className="text-gray-500 text-lg">Ödeme durumu kontrol ediliyor...</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Status Banner */}
              <div className={`p-8 text-center ${isSuccess
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  {isSuccess ? (
                    <CheckCircle2 size={40} className="text-white" />
                  ) : (
                    <XCircle size={40} className="text-white" />
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">
                  {isSuccess ? 'Ödeme Başarılı! 🎉' : 'Ödeme Başarısız'}
                </h1>
                <p className="text-white/80 text-sm">
                  {isSuccess
                    ? 'Siparişiniz alındı ve işleme konuldu.'
                    : 'Ödeme işlemi sırasında bir sorun oluştu.'}
                </p>
              </div>

              {/* Payment Details */}
              <div className="p-8">
                {payment && (
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <CreditCard size={18} className="text-brand-purple shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Sipariş No</p>
                        <p className="font-bold text-brand-dark">#{payment.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Package size={14} className="text-gray-400" />
                          <p className="text-xs text-gray-400">Tutar</p>
                        </div>
                        <p className="font-extrabold text-brand-dark text-lg">
                          {payment.paidPrice?.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-gray-400" />
                          <p className="text-xs text-gray-400">Tarih</p>
                        </div>
                        <p className="font-semibold text-brand-dark text-sm">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleString('tr-TR') : '-'}
                        </p>
                      </div>
                    </div>

                    {payment.iyzicoPaymentId && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-600 mb-0.5">iyzico Ödeme ID</p>
                        <p className="font-mono text-sm text-green-800 break-all">{payment.iyzicoPaymentId}</p>
                      </div>
                    )}

                    {payment.errorMessage && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 mb-0.5">Hata Detayı</p>
                        <p className="text-sm text-red-800">{payment.errorMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/orders"
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-brand-purple text-white font-semibold rounded-xl hover:bg-brand-purple-dark transition-colors"
                  >
                    <Package size={18} />
                    Siparişlerim
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-gray-100 text-brand-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <ShoppingBag size={18} />
                    Alışverişe Devam Et
                  </Link>
                  {!isSuccess && (
                    <Link
                      href="/checkout"
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-gray-100 text-brand-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <ArrowLeft size={18} />
                      Tekrar Dene
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={48} className="text-brand-purple animate-spin" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
