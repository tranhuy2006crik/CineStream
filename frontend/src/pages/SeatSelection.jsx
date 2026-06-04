import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [holdingSeats, setHoldingSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchShowtime();
    fetchSeats();
    
    // Auto refresh seats every 10 seconds to catch expired holds
    const interval = setInterval(fetchSeats, 10000);
    return () => clearInterval(interval);
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      const res = await fetch(`/api/showtimes/${showtimeId}`);
      if (!res.ok) throw new Error('Showtime not found');
      const data = await res.json();
      setShowtime(data);
    } catch (err) {
      console.error(err);
      navigate('/booking');
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await fetch(`/api/bookings/showtimes/${showtimeId}/seats`);
      const data = await res.json();
      setBookedSeats(data.bookedSeats || []);
      setHoldingSeats(data.holdingSeats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSeat = (seatCode) => {
    if (bookedSeats.includes(seatCode) || holdingSeats.includes(seatCode)) return;
    
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      // User must log in first
      alert('Please log in to book tickets.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const totalAmount = selectedSeats.length * (showtime?.pricing?.basePrice || 0);
      
      const res = await fetch('/api/bookings/create_payment_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showtimeId,
          seats: selectedSeats,
          totalAmount,
          bankCode: '' // Allow user to select bank on VNPay
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message || 'Booking failed');
        setIsProcessing(false);
        fetchSeats(); // Refresh seats to show they might be held
        setSelectedSeats([]);
        return;
      }
      
      // Redirect to VNPay
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading || !showtime) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  // Render a simple grid map based on showtime's theater capacity.
  // Assuming a generic grid like 10 rows (A-J) and 12 columns (1-12) if theater capacity is unknown.
  // For production, this should be fetched from theater.seatLayout
  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  const cols = Array.from({length: 12}, (_, i) => i + 1);

  const basePrice = showtime.pricing?.basePrice || 0;
  const totalAmount = selectedSeats.length * basePrice;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans selection:bg-primary-container/30">
      <Navbar />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-12 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Seat Map */}
          <div className="flex-1 bg-surface-container rounded-2xl p-6 border border-white/5">
            <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
            
            <div className="mb-12">
              <div className="w-3/4 mx-auto h-12 bg-white/10 rounded-[50%] mt-8 border-t-[8px] border-primary-container shadow-[0_-15px_30px_rgba(229,9,20,0.3)] relative flex justify-center items-center">
                <span className="absolute -top-6 text-on-surface-variant font-bold tracking-widest uppercase text-sm">SCREEN</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 overflow-x-auto pb-4">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-2">
                  <div className="w-6 text-center font-bold text-on-surface-variant">{row}</div>
                  <div className="flex gap-2">
                    {cols.map(col => {
                      const seatCode = `${row}${col}`;
                      const isBooked = bookedSeats.includes(seatCode);
                      const isHolding = holdingSeats.includes(seatCode);
                      const isSelected = selectedSeats.includes(seatCode);
                      
                      let seatClass = "w-8 h-8 rounded-t-lg rounded-b-sm cursor-pointer transition-colors border flex items-center justify-center text-[10px] font-bold ";
                      
                      if (isBooked) {
                        seatClass += "bg-white/10 border-white/5 text-transparent cursor-not-allowed";
                      } else if (isHolding) {
                        seatClass += "bg-surface-container-highest border-white/10 text-on-surface-variant/30 cursor-not-allowed"; // Grayed out
                      } else if (isSelected) {
                        seatClass += "bg-primary-container border-primary-container text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]";
                      } else {
                        seatClass += "bg-transparent border-white/20 hover:border-primary-container hover:bg-primary-container/10 text-on-surface";
                      }

                      return (
                        <div 
                          key={seatCode} 
                          className={seatClass}
                          onClick={() => toggleSeat(seatCode)}
                          title={isBooked ? 'Booked' : isHolding ? 'Holding' : 'Available'}
                        >
                          {col}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-6 text-center font-bold text-on-surface-variant">{row}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-white/20"></div>
                <span className="text-sm text-on-surface-variant">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-primary-container border-primary-container shadow-[0_0_10px_rgba(229,9,20,0.5)]"></div>
                <span className="text-sm text-on-surface-variant">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-surface-container-highest border-white/10"></div>
                <span className="text-sm text-on-surface-variant">Holding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-white/10 border-white/5"></div>
                <span className="text-sm text-on-surface-variant">Booked</span>
              </div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="w-full lg:w-[400px] flex-none">
            <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden sticky top-24">
              {showtime.movie?.poster && (
                <div className="h-40 w-full relative">
                  <img src={showtime.movie.poster} className="w-full h-full object-cover opacity-60" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white truncate">{showtime.movie?.title}</h3>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Cinema</div>
                    <div className="font-medium">{showtime.cinema?.name}</div>
                    <div className="text-sm text-on-surface-variant">{showtime.cinema?.address}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Date & Time</div>
                      <div className="font-medium">{new Date(showtime.startTime).toLocaleDateString()}</div>
                      <div className="text-primary-container font-bold">{new Date(showtime.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Theater</div>
                      <div className="font-medium">{showtime.theater?.name || 'Standard'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Seats</div>
                    <div className="font-medium">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-on-surface-variant">Tickets x {selectedSeats.length}</div>
                    <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold mt-4">
                    <div>Total</div>
                    <div className="text-primary-container">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0 || isProcessing}
                  className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-4 rounded-xl transition shadow-[0_0_15px_rgba(229,9,20,0.4)] disabled:opacity-50 disabled:shadow-none flex justify-center items-center"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</>
                  ) : (
                    'Proceed to Payment (VNPay)'
                  )}
                </button>
                <p className="text-xs text-center text-on-surface-variant mt-4">
                  Upon clicking "Proceed", your seats will be held for 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
