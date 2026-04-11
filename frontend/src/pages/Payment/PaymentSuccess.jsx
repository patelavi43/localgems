import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPaymentByBooking } from '../../services/payment.service';

export default function PaymentSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    getPaymentByBooking(bookingId)
      .then((res) => setPayment(res.data.data))
      .catch(() => {});
  }, [bookingId]);

  const totalINR = payment ? payment.total_amount / 100 : null;

  return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center bg-purple-900/60 backdrop-blur border border-purple-700/40 rounded-2xl shadow-2xl px-8 py-12">

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/40">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-purple-300 text-sm mb-6">
          Your booking is confirmed and the talent has been notified.
        </p>

        {payment && (
          <div className="bg-purple-800/40 rounded-xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-purple-400">Amount Paid</span>
              <span className="text-white font-bold">₹{totalINR?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-400">Payment ID</span>
              <span className="text-green-400 font-mono text-xs">{payment.razorpay_payment_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-400">Status</span>
              <span className="text-green-400 font-semibold capitalize">{payment.status}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all"
          >
            My Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-purple-600 hover:bg-purple-800/50 text-purple-300 font-semibold py-3 rounded-xl transition-all"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}