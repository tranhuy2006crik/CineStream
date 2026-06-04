import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      // VNPay appends all its return params to the URL query string
      const queryString = searchParams.toString();
      
      if (!queryString) {
        setStatus('error');
        setMessage('Invalid payment return.');
        return;
      }

      try {
        const res = await fetch(`/api/bookings/vnpay_return?${queryString}`);
        const data = await res.json();

        if (data.code === '00') {
          setStatus('success');
          setMessage('Payment successful! Your seats are confirmed.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment failed or was cancelled.');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage('Could not verify payment status.');
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

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
              <CheckCircle className="text-green-500 mb-6" size={80} />
              <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-on-surface-variant mb-8">{message}</p>
              
              <button 
                onClick={() => navigate('/my-tickets')}
                className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-4 rounded-xl transition shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              >
                View My Tickets
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="text-red-500 mb-6" size={80} />
              <h2 className="text-3xl font-bold mb-2">Payment Failed</h2>
              <p className="text-on-surface-variant mb-8">{message}</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => navigate('/booking')}
                  className="flex-1 bg-surface-container-highest hover:bg-white/10 text-on-surface font-bold py-3 px-4 rounded-xl transition border border-white/10"
                >
                  Back to Movies
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
