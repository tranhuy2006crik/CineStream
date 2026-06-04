import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    // Skip on first mount
    if (prevLocation.current === location.pathname) return;

    // Start film-reel fade out
    setIsTransitioning(true);

    // After fade-out, swap content and fade back in
    const fadeOutTimer = setTimeout(() => {
      setDisplayChildren(children);
      window.scrollTo(0, 0);

      const fadeInTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 100);

      return () => clearTimeout(fadeInTimer);
    }, 500);

    prevLocation.current = location.pathname;

    return () => clearTimeout(fadeOutTimer);
  }, [location.pathname, children]);

  // Update children immediately if location hasn't changed (e.g. local state updates)
  useEffect(() => {
    if (prevLocation.current === location.pathname && !isTransitioning) {
      setDisplayChildren(children);
    }
  }, [children, location.pathname, isTransitioning]);

  return (
    <>
      {/* Film-reel transition overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#000',
          pointerEvents: isTransitioning ? 'auto' : 'none',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          backgroundImage: isTransitioning
            ? 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)'
            : 'none',
        }}
      >
        {/* Film sprocket holes */}
        {isTransitioning && (
          <>
            <div style={{
              position: 'absolute',
              left: '20px',
              top: 0,
              bottom: 0,
              width: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
              alignItems: 'center',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`l${i}`} style={{
                  width: '16px',
                  height: '10px',
                  borderRadius: '3px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }} />
              ))}
            </div>
            <div style={{
              position: 'absolute',
              right: '20px',
              top: 0,
              bottom: 0,
              width: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
              alignItems: 'center',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`r${i}`} style={{
                  width: '16px',
                  height: '10px',
                  borderRadius: '3px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }} />
              ))}
            </div>
            {/* Center loading text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(229, 9, 20, 0.8)',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              animation: 'pulse 1s ease-in-out infinite',
            }}>
              CINESTREAM
            </div>
          </>
        )}
      </div>

      {/* Page content with fade */}
      <div
        style={{
          opacity: isTransitioning ? 0.2 : 1,
          transform: isTransitioning ? 'scale(0.97)' : 'scale(1)',
          filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
          transition: 'all 0.5s ease-in-out',
        }}
      >
        {displayChildren}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
