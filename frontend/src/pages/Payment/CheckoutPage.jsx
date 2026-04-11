import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../../services/payment.service';
import { bookingAPI } from '../../services/api';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Fetch booking details
  useEffect(() => {
  bookingAPI.getById(bookingId)
    .then(({ data }) => {
      setBooking(data.data);
      setLoading(false);
    })
    .catch(() => {
      setError('Could not load booking details.');
      setLoading(false);
    });
}, [bookingId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Razorpay failed to load. Check your internet connection.');
        setPaying(false);
        return;
      }

      const { data } = await createPaymentOrder(bookingId);
      const orderData = data.data;
      setBreakdown(orderData.breakdown);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LocalGems',
        description: `Booking with ${orderData.booking.talent_name}`,
        image: '/logo.png', // your logo
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/payment/success/${bookingId}`);
          } catch {
            setError('Payment verification failed. Contact support.');
            setPaying(false);
          }
        },
        prefill: {
          name: booking?.user_id?.name || '',
          email: booking?.user_id?.email || '',
        },
        theme: {
          color: '#7c3aed', // matches your purple theme
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not initiate payment.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-950">
        <div className="text-white text-lg animate-pulse">Loading booking details...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-950">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  const basePrice = booking?.agreedPrice || 0;
  const platformFee = Math.round(basePrice * 0.1);
  const total = basePrice + platformFee;

  const eventDate = booking?.event_date
    ? new Date(booking.event_date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-purple-900/60 backdrop-blur border border-purple-700/40 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-purple-800/50 px-6 py-5 border-b border-purple-700/40">
          <h1 className="text-xl font-bold text-white">Complete Payment</h1>
          <p className="text-purple-300 text-sm mt-1">Secure checkout via Razorpay</p>
        </div>

        {/* Booking Summary */}
        <div className="px-6 py-5 space-y-3 border-b border-purple-700/40">
          <h2 className="text-purple-300 text-xs uppercase tracking-widest font-semibold">Booking Summary</h2>
          <div className="flex items-center gap-3">
            <img
              src={
                booking?.talent_id?.profile_pic ||
                `https://api.dicebear.com/7.x/personas/svg?seed=${booking?.talent_id?.name}`
              }
              alt="Talent"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <p className="text-white font-semibold">{booking?.talent_id?.name || 'Talent'}</p>
              <p className="text-purple-300 text-sm">{booking?.talent_id?.category || 'Artist'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-purple-800/40 rounded-lg p-3">
              <p className="text-purple-400 text-xs">Event Date</p>
              <p className="text-white text-sm font-medium mt-1">{eventDate}</p>
            </div>
            <div className="bg-purple-800/40 rounded-lg p-3">
              <p className="text-purple-400 text-xs">Time</p>
              <p className="text-white text-sm font-medium mt-1">
                {booking?.startTime} – {booking?.endTime || '—'}
              </p>
            </div>
            {booking?.eventType && (
              <div className="bg-purple-800/40 rounded-lg p-3 col-span-2">
                <p className="text-purple-400 text-xs">Event Type</p>
                <p className="text-white text-sm font-medium mt-1">{booking.eventType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="px-6 py-5 space-y-3 border-b border-purple-700/40">
          <h2 className="text-purple-300 text-xs uppercase tracking-widest font-semibold">Price Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Talent Fee</span>
              <span className="text-white font-medium">₹{basePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Platform Fee (10%)</span>
              <span className="text-white font-medium">₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-purple-700/40 pt-2 flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-purple-300 font-bold text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-purple-700/40">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            SSL Secured
          </div>
          <div className="flex items-center gap-1.5 text-purple-400 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Razorpay Protected
          </div>
          <div className="flex items-center gap-1.5 text-purple-400 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            UPI / Cards / NetBanking
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/40 border border-red-500/40 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <div className="px-6 py-5">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
          >
            {paying ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay ₹{total.toLocaleString('en-IN')}
              </>
            )}
          </button>
          <p className="text-center text-purple-500 text-xs mt-3">
            By paying you agree to LocalGems' Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
}