import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const res = await fetch('/api/bookings/my-tickets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setTickets(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
      <Navbar />
      <div className="flex-1 max-w-[1000px] w-full mx-auto px-4 py-12 pt-32">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Ticket className="text-primary-container" size={32} />
          My Ticket Bag
        </h1>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary-container" size={40} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-12 text-center border border-white/5">
            <Ticket className="mx-auto text-on-surface-variant mb-4 opacity-50" size={60} />
            <h2 className="text-xl font-bold mb-2">No tickets yet</h2>
            <p className="text-on-surface-variant mb-6">You haven't purchased any movie tickets yet.</p>
            <a href="/booking" className="inline-block bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-6 rounded-xl transition">
              Browse Movies
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <div key={ticket._id} className="bg-surface-container flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-white/10 relative">
                
                {/* Status Ribbon */}
                <div className={`absolute top-4 -right-8 rotate-45 px-10 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  ticket.status === 'paid' ? 'bg-green-500 text-black' : 
                  ticket.status === 'pending' ? 'bg-yellow-500 text-black' : 
                  'bg-red-500 text-white'
                }`}>
                  {ticket.status}
                </div>

                <div className="w-full sm:w-1/3 bg-surface-container-highest flex-none relative min-h-[160px]">
                  {ticket.showtime?.movie?.poster ? (
                    <img src={ticket.showtime.movie.poster} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">No Image</div>
                  )}
                  {ticket.status === 'paid' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
                      {/* Ticket QR Code */}
                      <div className="bg-white p-2 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <QRCodeSVG value={`TICKET:${ticket._id}`} size={100} />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 truncate pr-8">{ticket.showtime?.movie?.title || 'Unknown Movie'}</h3>
                    <div className="text-xs text-on-surface-variant mb-3">{ticket.showtime?.cinema?.name}</div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Date</div>
                        <div className="font-medium">{new Date(ticket.showtime?.startTime).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Time</div>
                        <div className="text-primary-container font-bold">{new Date(ticket.showtime?.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Theater</div>
                        <div className="font-medium">{ticket.showtime?.theater?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Seats</div>
                        <div className="font-bold text-white">{ticket.seats.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3 mt-2 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Total Paid</div>
                      <div className="font-bold text-lg text-green-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.totalAmount)}</div>
                    </div>
                    <div className="text-[10px] text-on-surface-variant text-right">
                      ID: {ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
