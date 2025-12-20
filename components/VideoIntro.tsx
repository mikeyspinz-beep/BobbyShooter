import React, { useState, useEffect } from 'react';
import { ASSETS } from '../constants';

interface VideoIntroProps {
  onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Vendetta Studios Reveal
    const t1 = setTimeout(() => setPhase(1), 500);
    // Phase 2: Starring DKAY
    const t2 = setTimeout(() => setPhase(2), 2500);
    // Phase 3: Big Logo Zoom
    const t3 = setTimeout(() => setPhase(3), 4500);
    // Phase 4: Final Flash/Transition
    const t4 = setTimeout(() => onComplete(), 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      <style>{`
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-5deg); filter: hue-rotate(90deg); }
          21% { transform: skew(5deg); }
          40% { transform: skew(0deg); filter: hue-rotate(0deg); }
          100% { transform: skew(0deg); }
        }
        @keyframes crt-flicker {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.9; }
        }
        @keyframes logo-zoom {
          0% { transform: scale(0.1); opacity: 0; filter: blur(10px) brightness(0); }
          50% { transform: scale(1.2); opacity: 1; filter: blur(0px) brightness(1.5); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px) brightness(1); }
        }
        .intro-text {
          font-family: 'Teko', sans-serif;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: white;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          animation: glitch-skew 2s infinite linear alternate-reverse;
        }
        .scanlines {
          background: linear-gradient(to bottom, transparent, transparent 50%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.5));
          background-size: 100% 4px;
          pointer-events: none;
        }
      `}</style>

      <div className="absolute inset-0 scanlines opacity-30 z-10"></div>
      <div className="absolute inset-0 bg-black animate-[crt-flicker_0.1s_infinite] opacity-5 pointer-events-none z-20"></div>

      {/* PHASE 1: VENDETTA STUDIOS */}
      {phase === 1 && (
        <div className="flex flex-col items-center animate-pulse">
          <p className="text-xl text-yellow-500 mb-2 font-light">A PRODUCTION BY</p>
          <h2 className="text-6xl md:text-8xl intro-text font-black italic">VENDETTA STUDIOS</h2>
        </div>
      )}

      {/* PHASE 2: STARRING DKAY */}
      {phase === 2 && (
        <div className="flex flex-col items-center text-center px-4">
          <h3 className="text-4xl md:text-6xl intro-text mb-4">STARRING <span className="text-red-600">DKAY</span></h3>
          <p className="text-2xl text-gray-500 tracking-[1em] font-light">FEATURING THE LEGENDS</p>
        </div>
      )}

      {/* PHASE 3: LOGO REVEAL */}
      {phase >= 3 && (
        <div className="relative flex flex-col items-center justify-center p-8 w-full max-w-5xl">
          <div className="absolute inset-0 bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <img 
            src={ASSETS.LOGO} 
            alt="Logo" 
            className="w-full h-auto object-contain z-10 animate-[logo-zoom_3s_ease-out_forwards]"
          />
          <div className="absolute bottom-[-10vh] flex flex-col items-center opacity-0 animate-[fadeIn_1s_ease-out_2s_forwards]">
            <p className="text-yellow-500 text-3xl font-bold tracking-[0.5em] italic">VENDETTA</p>
            <div className="w-64 h-1 bg-white/20 mt-4 overflow-hidden">
               <div className="h-full bg-yellow-500 animate-[growWidth_4s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}

      {/* SKIP BUTTON */}
      <button 
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-gray-600 hover:text-white transition-colors text-2xl font-bold tracking-widest z-50 border-b border-transparent hover:border-white"
      >
        SKIP INTRO &gt;&gt;
      </button>
    </div>
  );
};
