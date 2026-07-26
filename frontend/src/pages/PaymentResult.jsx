import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2, CheckCircle, XCircle, Film, Ticket, Crown, ArrowLeft } from 'lucide-react';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [paymentType, setPaymentType] = useState(null); // 'booking' | 'vod_rental' | 'package'
  const [pendingRental, setPendingRental] = useState(null);

  useEffect(() => {
    // Try to read any stored rental info from localStorage (stored in VODPlayer before redirect)
    try {
      const raw = localStorage.getItem('pending_rental');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.movieId) setPendingRental(parsed);
      }
    } catch (_) { /* ignore */ }

    const handlePaymentReturn = async () => {
      const queryString = searchParams.toString();

      if (!queryString) {
        setStatus('error');
        setMessage('Invalid payment return.');
        return;
      }

      try {
        const gateway = searchParams.get('gateway');
        const endpoint = gateway === 'momo' ? '/api/bookings/momo_return' : '/api/bookings/vnpay_return';
        const url = `${endpoint}?${queryString}`;

        console.debug('Payment result fetch:', { endpoint, url, gateway, queryString });

        const res = await fetch(url);
        const text = await res.text();

        if (!res.ok) {
          console.error('Payment result fetch failed:', { status: res.status, statusText: res.statusText, body: text });
          setStatus('error');
          setMessage(`Payment verification failed: ${res.status} ${res.statusText}. See console for details.`);
          return;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('Failed to parse payment result JSON:', parseErr, { body: text });
          setStatus('error');
          setMessage('Payment verification failed: invalid backend response.');
          return;
        }
        console.debug('Payment result response:', data);

        if (data.type) setPaymentType(data.type);

        if (data.code === '00') {
          setStatus('success');

          // Clear pending_rental from localStorage after VOD success
          if (data.type === 'vod_rental') {
            try { localStorage.removeItem('pending_rental'); } catch (_) { /* ignore */ }
          }

          if (data.type === 'vod_rental') {
            setMessage('Rental successful! You can now watch this movie for the next 48 hours.');
          } else if (data.type === 'package') {
            setMessage('Your subscription has been activated. Enjoy unlimited access to your tier.');
          } else {
            setMessage('Payment successful! Your seats are confirmed.');
          }
        } else {
          setStatus('error');
          if (data.type === 'vod_rental') {
            setMessage(`Rental payment failed: ${data.message || 'Unknown error'} (${data.code || 'no_code'})`);
          } else if (data.type === 'package') {
            setMessage(`Subscription payment failed: ${data.message || 'Unknown error'} (${data.code || 'no_code'})`);
          } else {
            setMessage(`Payment verification failed: ${data.message || 'Unknown error'} (${data.code || 'no_code'})`);
          }
        }
      } catch (err) {
        console.error('Payment result exception:', err);
        setStatus('error');
        setMessage(`Could not verify payment status. ${err.message}`);
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

  const successIcon = () => {
    if (paymentType === 'vod_rental') return <Film className="text-green-500 mb-6" size={80} />;
    if (paymentType === 'package') return <Crown className="text-amber-400 mb-6" size={80} />;
    return <CheckCircle className="text-green-500 mb-6" size={80} />;
  };

  const successTitle = () => {
    if (paymentType === 'vod_rental') return 'Rental Successful!';
    if (paymentType === 'package') return 'Subscription Activated!';
    return 'Booking Confirmed!';
  };

  const errorBackButton = () => {
    if (paymentType === 'vod_rental' && pendingRental?.movieId) {
      return (
        <button
          onClick={() => navigate(`/vod/${pendingRental.movieId}`)}
          className="flex-1 bg-surface-container-highest hover:bg-white/10 text-on-surface font-bold py-3 px-4 rounded-xl transition border border-white/10 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Back to Movie
        </button>
      );
    }
    return (
      <button
        onClick={() => navigate(paymentType === 'package' ? '/pricing' : '/booking')}
        className="flex-1 bg-surface-container-highest hover:bg-white/10 text-on-surface font-bold py-3 px-4 rounded-xl transition border border-white/10"
      >
        {paymentType === 'package' ? 'Back to Pricing' : 'Back to Movies'}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
      <Navbar />
      <div className="flex-1 max-w-[600px] w-full mx-auto px-4 py-12 pt-32 flex flex-col items-center justify-center">
        <div className="bg-surface-container rounded-3xl p-10 w-full border border-white/5 shadow-2xl text-center">
          
          {status === 'processing' && (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-primary-container mb-6" size={60} />
              <h2 className="text-2xl font-bold">Verifying Payment...</h2>
              <p className="text-on-surface-variant mt-2">Please wait while we confirm your transaction.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              {successIcon()}
              <h2 className="text-3xl font-bold mb-2">{successTitle()}</h2>
              <p className="text-on-surface-variant mb-8">{message}</p>
              
              <div className="flex flex-col gap-3 w-full">
                {paymentType === 'vod_rental' && (
                  <button
                    onClick={() => navigate(pendingRental?.movieId ? `/vod/${pendingRental.movieId}` : '/vod')}
                    className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-4 rounded-xl transition shadow-[0_0_15px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2"
                  >
                    <Film size={18} /> Watch Now
                  </button>
                )}
                {paymentType === 'package' && (
                  <button
                    onClick={() => navigate('/vod')}
                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    <Crown size={18} /> Browse VOD
                  </button>
                )}
                {paymentType === 'booking' && (
                  <button
                    onClick={() => navigate('/my-tickets')}
                    className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-4 rounded-xl transition shadow-[0_0_15px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2"
                  >
                    <Ticket size={18} /> View My Tickets
                  </button>
                )}
                {!paymentType && (
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-4 rounded-xl transition shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                  >
                    Back to Home
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="text-red-500 mb-6" size={80} />
              <h2 className="text-3xl font-bold mb-2">Payment Failed</h2>
              <p className="text-on-surface-variant mb-8">{message}</p>
              
              <div className="flex gap-4 w-full">
                {errorBackButton()}
              </div>
            </div>
          )}
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
