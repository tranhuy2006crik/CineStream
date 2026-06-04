import { useState, useRef, useEffect } from 'react';
import { Save, RefreshCw, X, Hand, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export default function AdminSeatMapBuilder() {
  const { cinemaId, theaterId } = useParams();

  const [brushes, setBrushes] = useState([
    { id: 'standard', name: 'Standard', bg: '#2a2a2a', border: 'rgba(255,255,255,0.1)', text: '#a1a1aa' },
    { id: 'vip', name: 'VIP', bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.8)', text: '#eab308', shadow: '0 0 10px rgba(234,179,8,0.2)' },
    { id: 'couple', name: 'Couple', bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.8)', text: '#ec4899', shadow: '0 0 10px rgba(236,72,153,0.2)' },
    { id: 'disabled', name: 'Broken', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'rgba(239, 68, 68, 0.5)', icon: 'X' },
    { id: 'aisle', name: 'Aisle', bg: 'transparent', border: 'rgba(255,255,255,0.1)', text: 'transparent', dashed: true },
  ]);

  // Grid State
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(14);
  
  // Interaction State
  const [mode, setMode] = useState('pan'); // 'pan' or 'build'
  const [selectedBrush, setSelectedBrush] = useState('standard');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  
  // Modals
  const [showAddSeat, setShowAddSeat] = useState(false);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Initialize matrix (will be overwritten by fetch)
  const [seatMap, setSeatMap] = useState([]);
  const [theaterName, setTheaterName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  // Global mouse up for pan and paint
  useEffect(() => {
    fetchTheater();

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPainting(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const fetchTheater = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/theaters/${theaterId}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows);
        setCols(data.cols);
        setTheaterName(data.name);
        if (data.customSeatTypes) setBrushes(data.customSeatTypes);
        if (data.seatMap) setSeatMap(data.seatMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMap = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/theaters/${theaterId}/map`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rows,
          cols,
          customSeatTypes: brushes,
          seatMap
        })
      });
      if (res.ok) {
        alert('Seat map saved successfully!');
      } else {
        alert('Failed to save map');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving map');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-on-surface-variant flex items-center justify-center h-screen">Loading Seat Map...</div>;
  }

  // Handle Wheel (Zoom and Pan)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Zoom
        const zoomDelta = e.deltaY * -0.002;
        setZoom(z => Math.min(Math.max(0.5, z + zoomDelta), 2.5));
      } else {
        // Pan
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button === 1 || mode === 'pan' || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const applyBrush = (rIndex, cIndex) => {
    setSeatMap(prev => {
      const newMap = [...prev];
      newMap[rIndex] = [...newMap[rIndex]];
      const currentType = newMap[rIndex][cIndex].type;
      const newType = (currentType === selectedBrush && selectedBrush !== 'standard') ? 'standard' : selectedBrush;
      newMap[rIndex][cIndex] = { ...newMap[rIndex][cIndex], type: newType };
      return newMap;
    });
  };

  const handleSeatDown = (e, rIndex, cIndex) => {
    if (mode === 'pan' || e.button !== 0) return;
    e.stopPropagation(); 
    setIsPainting(true);
    applyBrush(rIndex, cIndex);
  };

  const handleSeatEnter = (rIndex, cIndex) => {
    if (mode !== 'build' || !isPainting) return;
    setSeatMap(prev => {
      const newMap = [...prev];
      newMap[rIndex] = [...newMap[rIndex]];
      newMap[rIndex][cIndex] = { ...newMap[rIndex][cIndex], type: selectedBrush };
      return newMap;
    });
  };

  const handleRowsChange = (e) => {
    const newRowsCount = Number(e.target.value);
    if (newRowsCount < 1 || newRowsCount > 50) return;
    setRows(newRowsCount);
    setSeatMap(prev => {
      const newMap = [...prev];
      if (newRowsCount > prev.length) {
        for (let r = prev.length; r < newRowsCount; r++) {
          newMap.push(Array(cols).fill(null).map((_, c) => ({
            id: `${String.fromCharCode(65 + r)}${c + 1}`,
            row: String.fromCharCode(65 + r),
            col: c + 1,
            type: 'standard'
          })));
        }
      } else if (newRowsCount < prev.length) {
        newMap.splice(newRowsCount);
      }
      return newMap;
    });
  };

  const handleColsChange = (e) => {
    const newColsCount = Number(e.target.value);
    if (newColsCount < 1 || newColsCount > 50) return;
    setCols(newColsCount);
    setSeatMap(prev => {
      return prev.map((row, r) => {
        const newRow = [...row];
        if (newColsCount > row.length) {
          for (let c = row.length; c < newColsCount; c++) {
            newRow.push({
              id: `${String.fromCharCode(65 + r)}${c + 1}`,
              row: String.fromCharCode(65 + r),
              col: c + 1,
              type: 'standard'
            });
          }
        } else if (newColsCount < row.length) {
          newRow.splice(newColsCount);
        }
        return newRow;
      });
    });
  };

  const clearAllSeats = () => {
    if (!window.confirm("Are you sure you want to clear the entire grid?")) return;
    const newMap = Array(rows).fill(null).map((_, r) => 
      Array(cols).fill(null).map((_, c) => ({
        id: `${String.fromCharCode(65 + r)}${c + 1}`,
        row: String.fromCharCode(65 + r),
        col: c + 1,
        type: 'standard'
      }))
    );
    setSeatMap(newMap);
  };

  const handleAddSeatType = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const bg = formData.get('bg');
    const text = formData.get('text');
    const border = formData.get('border');
    
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      setBrushes(prev => [...prev, {
        id, name, bg, border, text
      }]);
      setShowAddSeat(false);
    }
  };

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-64px)] flex flex-col bg-[#050505] overflow-hidden select-none relative">
      
      {/* Header Toolbar (Figma-like) - Made Responsive */}
      <div className="bg-[#111] border-b border-white/5 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 py-2 lg:h-16 flex-shrink-0 z-20 shadow-lg gap-3">
        
        {/* Left: Back Button & Context */}
        <div className="flex items-center gap-3 min-w-max">
          <Link 
            to="/admin/cinemas"
            className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface-variant transition-colors"
            title="Back to Cinemas"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Seat Map: {theaterName}</h1>
          <p className="text-on-surface-variant text-sm">Design layout and configure seat types.</p>
        </div>

        {/* Center: Tools */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner gap-1 order-3 lg:order-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setMode('pan')} 
            className={`p-2 rounded-lg flex items-center gap-2 transition-all ${mode === 'pan' ? 'bg-primary-container text-white shadow-md' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
          >
            <Hand size={18} />
            <span className="text-sm font-medium pr-1">Pan</span>
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {brushes.map(brush => (
            <button
              key={brush.id}
              onClick={() => { setMode('build'); setSelectedBrush(brush.id); }}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                mode === 'build' && selectedBrush === brush.id 
                  ? 'bg-primary-container text-white shadow-md' 
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <div 
                className="w-4 h-4 rounded shadow-sm border flex items-center justify-center text-[8px] font-bold"
                style={{ 
                  backgroundColor: brush.bg, 
                  borderColor: brush.border,
                  color: brush.text
                }}
              >
                {brush.icon || ''}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{brush.name}</span>
            </button>
          ))}
          
          <button 
            onClick={() => setShowAddSeat(true)}
            className="p-1.5 ml-1 rounded-lg hover:bg-white/10 text-on-surface-variant transition-colors flex-shrink-0"
            title="Add Seat Type"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Right: Grid Settings & Actions */}
        <div className="flex items-center gap-2 lg:gap-3 order-2 lg:order-3 min-w-max ml-auto">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-xs text-on-surface-variant font-medium">Grid:</span>
            <input 
              type="number" min="5" max="50" value={rows} onChange={handleRowsChange} 
              className="w-10 bg-transparent text-white text-sm text-center outline-none" 
              title="Rows"
            />
            <span className="text-white/30 text-xs">x</span>
            <input 
              type="number" min="5" max="50" value={cols} onChange={handleColsChange} 
              className="w-10 bg-transparent text-white text-sm text-center outline-none" 
              title="Columns"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant cursor-pointer"><Minus size={14}/></button>
            <span className="text-xs font-bold w-10 text-center text-on-surface-variant">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant cursor-pointer"><Plus size={14}/></button>
          </div>

          <button onClick={clearAllSeats} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface transition-colors cursor-pointer" title="Reset Grid">
            <RefreshCw size={18} />
          </button>
          
          <button className="bg-primary-container hover:bg-primary-container/80 text-white font-bold px-4 py-2 rounded-xl flex items-center shadow-[0_0_15px_rgba(229,9,20,0.2)] transition-colors cursor-pointer">
            <Save size={16} className="mr-2" /> Save
          </button>
        </div>

      </div>

      {/* Infinite Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        className={`flex-1 relative overflow-hidden ${mode === 'pan' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        <div 
          className="absolute top-1/2 left-1/2 origin-center transition-transform duration-75"
          style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})` }}
        >
          {/* Screen */}
          <div className="w-[600px] mx-auto mb-20 relative">
             <div className="h-2 w-full bg-white/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent blur-xl pointer-events-none transform perspective-[500px] rotateX-45"></div>
             <p className="text-center text-on-surface-variant/40 text-sm tracking-[0.5em] mt-6 font-black uppercase">Screen</p>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col items-center gap-3">
            {seatMap.map((row, rIndex) => (
              <div key={rIndex} className="flex items-center gap-3">
                <div className="w-8 text-center text-sm font-bold text-on-surface-variant/40 mr-4">
                  {String.fromCharCode(65 + rIndex)}
                </div>
                
                <div className="flex gap-2">
                  {row.map((seat, cIndex) => {
                    const brush = brushes.find(b => b.id === seat.type) || brushes[0];
                    const isDisabled = brush.icon === 'X';
                    
                    return (
                      <div 
                        key={seat.id}
                        onMouseDown={(e) => handleSeatDown(e, rIndex, cIndex)}
                        onMouseEnter={() => handleSeatEnter(rIndex, cIndex)}
                        title={`${seat.row}${seat.col} (${brush.name})`}
                        className={`
                          w-10 h-10 rounded-t-xl rounded-b-md border-2 flex items-center justify-center text-xs font-bold transition-all
                          ${mode === 'build' ? 'hover:scale-110 z-10' : ''}
                        `}
                        style={{
                          backgroundColor: brush.bg,
                          borderColor: brush.border,
                          color: brush.text,
                          borderStyle: brush.dashed ? 'dashed' : 'solid',
                          boxShadow: brush.shadow || 'none'
                        }}
                      >
                        {!brush.dashed && !isDisabled ? cIndex + 1 : ''}
                        {isDisabled && <X size={16} />}
                      </div>
                    );
                  })}
                </div>

                <div className="w-8 text-center text-sm font-bold text-on-surface-variant/40 ml-4">
                  {String.fromCharCode(65 + rIndex)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Seat Type Modal */}
      {showAddSeat && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleAddSeatType} className="bg-surface-container-high p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-on-surface">Add Custom Seat Type</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Seat Name (Note)</label>
                <input name="name" required placeholder="e.g. Sweetbox / Couple" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-on-surface outline-none focus:border-primary-container" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-on-surface-variant mb-1 block">Background</label>
                  <input name="bg" type="color" defaultValue="#ec4899" className="w-full h-10 bg-transparent rounded cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-on-surface-variant mb-1 block">Border</label>
                  <input name="border" type="color" defaultValue="#db2777" className="w-full h-10 bg-transparent rounded cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-on-surface-variant mb-1 block">Text</label>
                  <input name="text" type="color" defaultValue="#ffffff" className="w-full h-10 bg-transparent rounded cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddSeat(false)} className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-white/5">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary-container text-white font-bold">Add Seat</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
