import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { Loader2, Crown, Users2, Armchair } from 'lucide-react';

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

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
  }, [showtimeId]);

  useSocket(showtimeId, (data) => {
    if (data.bookedSeats) setBookedSeats(data.bookedSeats);
    if (data.holdingSeats) setHoldingSeats(data.holdingSeats);
  });

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

  // ============ PRICING ENGINE (PER-SEAT TYPE) ============
  const pricing = useMemo(() => {
    const p = showtime?.pricing || {};
    // Fallback: nếu có basePrice đơn lẻ thì dùng cho mọi loại
    const base = Number(p.basePrice) || 90000;
    return {
      normal: Number(p.normalPrice) || base,
      vip: Number(p.vipPrice) || Math.round(base * 1.4),
      couple: Number(p.couplePrice) || Math.round(base * 2)
    };
  }, [showtime]);

  // Helper: row letter to index (A=0, B=1 ... J=9)
  const rowIdx = (letter) => letter.charCodeAt(0) - 65;

  // Helper: Parse seatCode "A5" → { letter: 'A', colNum: 5 }
  const parseSeat = (seatCode) => {
    const m = seatCode.match(/^([A-Z])(\d+)$/);
    if (!m) return null;
    return { letter: m[1], colNum: parseInt(m[2], 10) };
  };

  // Get type của ghế từ theater.seatMap (2D array[row][col] = 'standard' | 'vip' | 'couple' | 'aisle' | 'disabled')
  // Nếu seatMap trống thì dùng heuristic (dùng cho dữ liệu cũ)
  const getSeatType = (letter, colNum) => {
    const r = rowIdx(letter);
    const c = colNum - 1; // col number 1-based → 0-based index
    const map = showtime?.theater?.seatMap;
    if (map && Array.isArray(map) && map[r] && Array.isArray(map[r]) && map[r][c]) {
      return map[r][c];
    }
    // Heuristic fallback nếu không có seatMap tùy chỉnh:
    //  - Hàng I-J (r=8,9): VIP (hàng cuối gần màn hình? Thường hàng giữa là VIP. Thay bằng hàng F-G giữa rạp)
    //  - Hàng A-B (r=0,1): COUPLE (2 ghế)
    //  - Các cột ở giữa (cột 4-9) hàng E-F: VIP
    //  - Còn lại: STANDARD
    if (r <= 1) return 'couple';
    if ((r === 5 || r === 6) && c >= 3 && c <= 8) return 'vip';
    if (r >= 8) return 'vip';
    return 'standard';
  };

  const getSeatPrice = (seatCode) => {
    const parsed = parseSeat(seatCode);
    if (!parsed) return pricing.normal;
    const type = getSeatType(parsed.letter, parsed.colNum);
    if (type === 'vip') return pricing.vip;
    if (type === 'couple') return pricing.couple;
    return pricing.normal;
  };

  // Tổng chi tiết theo loại cho checkout
  const breakdown = useMemo(() => {
    let standardCount = 0, vipCount = 0, coupleCount = 0;
    let standardSum = 0, vipSum = 0, coupleSum = 0;
    selectedSeats.forEach(sc => {
      const parsed = parseSeat(sc);
      if (!parsed) return;
      const type = getSeatType(parsed.letter, parsed.colNum);
      const price = getSeatPrice(sc);
      if (type === 'vip') { vipCount++; vipSum += price; }
      else if (type === 'couple') { coupleCount++; coupleSum += price; }
      else { standardCount++; standardSum += price; }
    });
    const subtotal = standardSum + vipSum + coupleSum;
    const fee = Math.round(subtotal * 0.05); // 5% fee dịch vụ
    return { standardCount, standardSum, vipCount, vipSum, coupleCount, coupleSum, subtotal, fee, total: subtotal + fee };
  }, [selectedSeats, showtime]); // eslint-disable-line

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    if (!token) {
      alert('Please log in to book tickets.');
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showtimeId,
          seats: selectedSeats,
          subtotal: breakdown.subtotal,
          serviceFee: breakdown.fee,
          totalAmount: breakdown.total
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Booking failed');
        setIsProcessing(false);
        fetchSeats();
        setSelectedSeats([]);
        return;
      }
      navigate(`/checkout/${data.bookingId}`);
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

  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  const cols = Array.from({length: 12}, (_, i) => i + 1);

  const fmt = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans selection:bg-primary-container/30">
      <Navbar />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-12 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Seat Map */}
          <div className="flex-1 bg-surface-container rounded-2xl p-6 border border-white/5">
            <h2 className="text-2xl font-bold mb-2">Select Your Seats</h2>
            <div className="text-on-surface-variant text-sm mb-6">
              Giá theo loại ghế:
              <span className="ml-2 text-on-surface font-semibold"><Armchair size={14} className="inline mr-1 -mt-0.5"/>Standard {fmt(pricing.normal)}</span>
              <span className="ml-3 text-amber-500 font-semibold"><Crown size={14} className="inline mr-1 -mt-0.5"/>VIP {fmt(pricing.vip)}</span>
              <span className="ml-3 text-fuchsia-400 font-semibold"><Users2 size={14} className="inline mr-1 -mt-0.5"/>Couple {fmt(pricing.couple)}</span>
              <span className="ml-2 text-on-surface-variant">（Phí 5%）</span>
            </div>

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
                      const seatType = getSeatType(row, col);
                      const isAisle = seatType === 'aisle' || seatType === 'disabled';
                      const isVip = seatType === 'vip';
                      const isCouple = seatType === 'couple';

                      let seatClass = "w-8 h-8 rounded-t-lg rounded-b-sm transition-colors border flex items-center justify-center text-[10px] font-bold ";
                      if (isAisle) {
                        seatClass += "bg-transparent border-transparent text-transparent pointer-events-none";
                      } else if (isBooked) {
                        seatClass += "bg-white/10 border-white/5 text-transparent cursor-not-allowed";
                      } else if (isHolding) {
                        seatClass += "bg-surface-container-highest border-white/10 text-on-surface-variant/30 cursor-not-allowed";
                      } else if (isSelected) {
                        seatClass += isVip
                          ? " cursor-pointer bg-amber-400 border-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : isCouple
                            ? " cursor-pointer bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]"
                            : " cursor-pointer bg-primary-container border-primary-container text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]";
                      } else {
                        // Available state — use subtle type tint
                        seatClass += " cursor-pointer border hover:scale-110 hover:shadow-md text-on-surface ";
                        seatClass += isVip
                          ? " bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400"
                          : isCouple
                            ? " bg-fuchsia-500/10 border-fuchsia-500/40 hover:bg-fuchsia-500/20 hover:border-fuchsia-400"
                            : " bg-transparent border-white/20 hover:border-primary-container hover:bg-primary-container/10";
                      }

                      return (
                        <div
                          key={seatCode}
                          className={seatClass}
                          onClick={() => !isAisle && toggleSeat(seatCode)}
                          title={isAisle ? '' : `${seatCode} · ${seatType.toUpperCase()} · ${fmt(getSeatPrice(seatCode))}${isBooked ? ' · Booked' : isHolding ? ' · Holding' : ''}`}
                        >
                          {isAisle ? '' : col}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-6 text-center font-bold text-on-surface-variant">{row}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-white/20 bg-transparent"></div>
                <span className="text-sm text-on-surface-variant">Standard ({fmt(pricing.normal)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-amber-500/20 border-amber-500/50"></div>
                <span className="text-sm text-on-surface-variant">VIP ({fmt(pricing.vip)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-fuchsia-500/20 border-fuchsia-500/50"></div>
                <span className="text-sm text-on-surface-variant">Couple ({fmt(pricing.couple)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-primary-container border-primary-container shadow-[0_0_10px_rgba(229,9,20,0.5)]"></div>
                <span className="text-sm text-on-surface-variant">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-white/10 border-white/5"></div>
                <span className="text-sm text-on-surface-variant">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-surface-container-highest border-white/10"></div>
                <span className="text-sm text-on-surface-variant">Holding</span>
              </div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="w-full lg:w-[420px] flex-none">
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
                      <div className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">Format</div>
                      <div className="font-medium text-sm">{showtime.format || '2D'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Seats ({selectedSeats.length})</div>
                    <div className="font-medium break-words">
                      {selectedSeats.length > 0
                        ? selectedSeats.map(sc => <span key={sc} className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/40 text-xs">{sc}</span>)
                        : <span className="text-on-surface-variant italic">None selected</span>}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6 space-y-2 text-sm">
                  {breakdown.standardCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Standard ×{breakdown.standardCount}</span>
                      <span>{fmt(breakdown.standardSum)}</span>
                    </div>
                  )}
                  {breakdown.vipCount > 0 && (
                    <div className="flex justify-between items-center text-amber-500">
                      <span className="font-semibold">VIP ×{breakdown.vipCount}</span>
                      <span>{fmt(breakdown.vipSum)}</span>
                    </div>
                  )}
                  {breakdown.coupleCount > 0 && (
                    <div className="flex justify-between items-center text-fuchsia-400">
                      <span className="font-semibold">Couple ×{breakdown.coupleCount}</span>
                      <span>{fmt(breakdown.coupleSum)}</span>
                    </div>
                  )}
                  {(breakdown.standardCount || breakdown.vipCount || breakdown.coupleCount) > 0 && (
                    <>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-on-surface-variant">Subtotal</span>
                        <span>{fmt(breakdown.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">Service fee (5%)</span>
                        <span>{fmt(breakdown.fee)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold mt-3">
                    <div>Total</div>
                    <div className="text-primary-container">{fmt(breakdown.total)}</div>
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
                    `Proceed to Checkout (${fmt(breakdown.total)})`
                  )}
                </button>
                <p className="text-xs text-center text-on-surface-variant mt-4">
                  Your seats will be held for 5 minutes at checkout.
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
