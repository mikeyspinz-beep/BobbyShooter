
import React, { useState, useRef, useEffect } from 'react';
import { ASSETS, CHARACTERS, ARENAS } from '../constants';

interface LandingPageProps {
  onPlay: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlay }) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [dlc1Installed, setDlc1Installed] = useState(false);
  const [dlc2Installed, setDlc2Installed] = useState(false);
  const [dlc3Installed, setDlc3Installed] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [unlockedChars, setUnlockedChars] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
      const d1 = localStorage.getItem('dlc1_installed') === 'true';
      const d2 = localStorage.getItem('dlc2_installed') === 'true';
      const d3 = localStorage.getItem('dlc3_installed') === 'true';
      const savedChars = localStorage.getItem('unlockedChars');
      
      setDlc1Installed(d1);
      setDlc2Installed(d2);
      setDlc3Installed(d3);
      
      if (savedChars) {
          try {
            setUnlockedChars(JSON.parse(savedChars));
          } catch(e) {
            setUnlockedChars(['default', 'kayla', 'matt']);
          }
      } else {
          setUnlockedChars(['default', 'kayla', 'matt']);
      }

      return () => {
          // Cleanup audio when leaving the landing page
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
          }
      };
  }, []);

  const isEligibleDLC1 = unlockedChars.includes('postmalone');
  const isEligibleDLC2 = unlockedChars.includes('jellyroll');
  const isEligibleDLC3 = unlockedChars.includes('biggie');

  const installDLC1 = () => { 
    if (!isEligibleDLC1) return;
    localStorage.setItem('dlc1_installed', 'true'); 
    setDlc1Installed(true); 
  };
  
  const installDLC2 = () => { 
    if (!isEligibleDLC2) return;
    localStorage.setItem('dlc2_installed', 'true'); 
    setDlc2Installed(true); 
  };
  
  const installDLC3 = () => { 
    if (!isEligibleDLC3) return;
    localStorage.setItem('dlc3_installed', 'true'); 
    setDlc3Installed(true); 
  };

  const handleEnter = () => {
    setHasEntered(true);
    const sfx = new Audio(ASSETS.SFX_ENTER); sfx.volume = 1.0; sfx.play().catch(e => console.error("SFX play failed", e));
    if (audioRef.current) { 
        audioRef.current.volume = 0.5; 
        audioRef.current.play().catch(e => console.log("Audio play failed", e)); 
    }
  };

  const handleStartGame = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      onPlay();
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-black text-white font-['Teko'] selection:bg-yellow-600 selection:text-black scroll-smooth relative">
      <audio ref={audioRef} src={ASSETS.MUSIC} loop />

      {isWiping && (
          <div className="fixed inset-0 z-[300] bg-red-950 flex flex-col items-center justify-center">
              <div className="text-white font-['Teko'] text-[10vw] font-black italic animate-pulse tracking-widest">WIPING...</div>
              <div className="text-red-500 font-mono text-xl uppercase">Memory Erased</div>
          </div>
      )}

      {!hasEntered && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
              <style>{`
                  @keyframes glitch-anim { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
                  .scanlines { background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2)); background-size: 100% 4px; }
                  .concrete-texture { background-image: url('https://www.transparenttextures.com/patterns/concrete-wall.png'); opacity: 0.2; }
              `}</style>
              <div className="absolute inset-0 concrete-texture pointer-events-none"></div>
              <div className="absolute inset-0 scanlines pointer-events-none opacity-50"></div>
              <div className="relative mb-8 text-center animate-pulse">
                   <img src={ASSETS.LOGO} alt="DKAY VENDETTA" className="max-w-[80vw] max-h-[40vh] object-contain" />
              </div>
              <button onClick={handleEnter} className="group relative px-12 py-6 bg-transparent border-y-4 border-yellow-500 text-yellow-500 text-4xl md:text-6xl uppercase tracking-widest overflow-hidden transition-all hover:bg-yellow-500 hover:text-black hover:scale-105 font-bold" >
                  <span className="relative z-10 animate-pulse font-['Permanent_Marker']">ENTER THE FIGHT</span>
                  <div className="absolute inset-0 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
              <p className="mt-8 text-gray-600 text-sm tracking-[0.5em] font-sans font-bold uppercase">Sound On // Parental Advisory</p>
          </div>
      )}

      {hasEntered && (
        <>
            <nav className="sticky top-0 w-full z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="h-full py-2"> <img src={ASSETS.LOGO} alt="DKAY VENDETTA" className="h-full object-contain" /> </div>
                    <button onClick={handleStartGame} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-2 font-bold text-2xl skew-x-[-20deg] border-2 border-white shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform hover:scale-105 active:scale-95" >
                        <span className="block skew-x-[20deg] tracking-widest font-['Permanent_Marker']">PLAY NOW</span>
                    </button>
                </div>
            </nav>

            <header className="relative min-h-[90vh] flex flex-col justify-end items-center overflow-hidden pb-12">
                <div className="absolute inset-0 z-0"> <img src={ASSETS.SITE_BG} alt="Background" className="w-full h-full object-cover object-top" /> <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div> </div>
                <div className="relative z-20 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
                    <img src={ASSETS.LOGO} alt="DKAY VENDETTA" className="w-full max-w-4xl object-contain mb-8 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" />
                    <button onClick={handleStartGame} className="relative group w-full md:w-auto px-16 py-6 bg-red-700/90 border-4 border-white/50 text-white text-5xl md:text-8xl uppercase tracking-tighter transform transition-all hover:bg-white hover:text-black hover:scale-105 shadow-[0_0_40px_rgba(255,0,0,0.4)] font-bold" > PLAY NOW </button>
                </div>
            </header>

            <section className="py-24 bg-neutral-950 border-y border-white/10 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-6xl md:text-8xl text-white mb-8 italic tracking-tighter font-bold font-['Teko'] uppercase">The <span className="text-red-600 font-['Permanent_Marker']">Beef</span></h2>
                            <div className="space-y-6 text-gray-400 text-2xl font-light leading-relaxed font-['Teko'] uppercase">
                                <p>It started as a diss track. It ended as a war. The biggest legends in hip-hop history have descended on your turf, and they aren't looking for a collab.</p>
                                <p><strong className="text-white">DKAY VENDETTA</strong> throws you into a chaotic arcade gauntlet. From the grimy alleys of Detroit to the VIP lounges of LA, you gotta shoot your way to the top.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-white/20 p-4 bg-white/5 skew-x-[-5deg]"> <div className="text-yellow-500 text-3xl mb-1 font-bold font-['Teko'] uppercase">Arcade Mode</div> <div className="text-sm text-gray-500 tracking-widest font-['Teko'] uppercase">Survive Endless Waves</div> </div>
                            <div className="border-2 border-white/20 p-4 bg-white/5 skew-x-[-5deg]"> <div className="text-red-500 text-3xl mb-1 font-bold font-['Teko'] uppercase">Shootout</div> <div className="text-sm text-gray-500 tracking-widest font-['Teko'] uppercase">1v1 Grudge Matches</div> </div>
                        </div>
                    </div>
                    <div className="relative group lg:mt-0">
                        <div className="absolute inset-0 bg-red-600 blur-[100px] opacity-20"></div>
                        <div className="relative border-8 border-white p-2 bg-black transform rotate-2 shadow-2xl transition-transform group-hover:rotate-0">
                             <img src={ASSETS.PROFILE_DK_REAL} alt="DKAY" className="w-full h-auto object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500" />
                             <div className="absolute bottom-4 left-4 bg-red-600 text-white px-6 py-2 text-4xl italic font-bold transform -skew-x-12 border-2 border-white font-['Teko']"> DKAY </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-black border-y border-white/20 overflow-hidden text-center relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <h3 className="text-5xl md:text-7xl text-white font-black italic tracking-tighter mb-6 font-['Teko'] uppercase"> Battle For <span className="text-yellow-500">Turf Supremacy</span> </h3>
                    <p className="text-gray-300 text-3xl md:text-4xl font-light font-['Teko'] tracking-wide uppercase"> Take the fight from the gritty alleys of <strong className="text-white">8 Mile</strong> Detroit to the exclusive VIP lounge of <strong className="text-purple-500">Club 662</strong>. Two distinct spots. No rules. </p>
                </div>
            </section>

            <section className="relative py-24 bg-neutral-900 overflow-hidden">
                <div className="absolute inset-0 w-full h-full"> <img src={ASSETS.THE_GOONS} alt="The Goons" className="w-full h-full object-cover opacity-20 blur-sm scale-110" /> <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-transparent"></div> </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                     <div className="space-y-6">
                        <div className="inline-block bg-red-600 text-white px-4 py-1 font-bold text-lg transform -skew-x-12 font-['Teko'] uppercase"> Know Your Enemy </div>
                        <h2 className="text-7xl md:text-9xl text-white font-bold italic leading-none font-['Teko'] uppercase"> Goon <span className="text-gray-500">Squad</span> </h2>
                        <div className="text-xl text-gray-400 font-['Teko'] tracking-wide border-l-2 border-red-600 pl-4 space-y-4 uppercase">
                            <p><strong className="text-white text-2xl block">The Black Goon (Street)</strong>Standard foot soldier. Balanced speed and aggression. Swarms in packs.</p>
                            <p><strong className="text-red-500 text-2xl block">The Blood Goon (Fast)</strong>High mobility specialist. Flanks quickly and strikes hard. Don't let them close the gap.</p>
                            <p><strong className="text-blue-500 text-2xl block">The Crip Goon (Tank)</strong>Heavy hitter. Slow moving but takes massive damage to drop. Requires heavy firepower.</p>
                        </div>
                     </div>
                     <div className="w-full h-[500px] border-8 border-white shadow-[20px_20px_0_rgba(0,0,0,0.5)] transform rotate-2 bg-black overflow-hidden relative group">
                         <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors"></div>
                         <img src={ASSETS.THE_GOONS} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" alt="Goon Squad" />
                     </div>
                </div>
            </section>

            <section className="py-24 bg-black relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/20 pb-4"> <div> <h2 className="text-6xl md:text-9xl text-white italic tracking-tighter font-bold font-['Teko'] uppercase">Fight <span className="text-yellow-500 font-['Permanent_Marker']">Card</span></h2> </div> </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {Object.entries(CHARACTERS).filter(([_, char]) => !char.dlcPack).map(([key, char]) => {
                             const isRival = ['2pac', 'biggie', 'diddy', 'snoop', 'jellyroll', '50cent', 'deebo', 'heinerman', 'mac', 'wiz', 'postmalone', 'slimshady', 'lilwayne'].includes(key);
                             return (
                                <div key={key} className={` group relative bg-neutral-900 border-2 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden aspect-[3/4] ${isRival ? 'border-red-900/50 hover:border-red-500' : 'border-white/10 hover:border-yellow-500'} `}>
                                    <div className="absolute inset-0">
                                        <div className={`absolute inset-0 bg-gradient-to-t ${isRival ? 'from-red-900/80' : 'from-yellow-900/60'} to-transparent z-10 opacity-30 group-hover:opacity-10 transition-opacity`}></div>
                                        <img src={ASSETS[char.profileImg as keyof typeof ASSETS] || ASSETS[char.img as keyof typeof ASSETS]} alt={char.name} className="h-full w-full object-cover object-top transition-all duration-500 scale-100 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = ASSETS.LOGO; }} />
                                    </div>
                                    <div className={`absolute bottom-0 w-full p-2 z-20 ${isRival ? 'bg-red-900/90' : 'bg-yellow-600/90'}`}>
                                        <div className="text-white text-xl md:text-2xl font-bold leading-none text-center uppercase truncate font-['Teko']">{char.name}</div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-32 bg-neutral-950 border-t-8 border-yellow-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="relative inline-block group">
                            <div className="absolute -inset-4 bg-purple-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <h2 className="relative text-9xl md:text-[12rem] text-white font-black italic tracking-tighter leading-none font-['Teko'] drop-shadow-[5px_5px_0_#000] uppercase"> The <span className="text-green-500 font-['Permanent_Marker']" style={{ WebkitTextStroke: '2px black' }}>Plug</span> 🔌 </h2>
                        </div>
                        <p className="mt-6 text-gray-300 text-3xl tracking-[0.3em] font-['Teko'] uppercase bg-black/50 inline-block px-4 py-1">Secure The Bag. Expand The Roster.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {/* THE G.O.B PACK */}
                        <div className={`bg-neutral-900 border-4 ${dlc1Installed ? 'border-green-600 shadow-[0_0_30px_rgba(22,163,74,0.2)]' : isEligibleDLC1 ? 'border-green-600 shadow-[0_0_50px_rgba(22,163,74,0.3)]' : 'border-red-900/50 grayscale'} p-8 relative flex flex-col transition-all duration-300 group`}>
                            {!dlc1Installed && !isEligibleDLC1 && (
                                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border-4 border-red-600/20 uppercase">
                                    <span className="text-5xl mb-2">🔒</span>
                                    <span className="text-red-500 font-black text-2xl uppercase tracking-tighter">Restricted Access</span>
                                    <span className="text-white font-bold text-xl mt-4 bg-red-600 px-4 py-1 skew-x-[-10deg]">Requirement:</span>
                                    <span className="text-white text-3xl font-black italic mt-1 drop-shadow-md">Unlock Post Malone</span>
                                </div>
                            )}
                            <div className="absolute -top-4 -right-4 bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl rotate-12 shadow-lg z-20 font-['Teko'] border-4 border-black">$$$</div>
                            <div className="flex-1 relative z-10">
                                <h3 className="text-5xl text-white font-black italic mb-2 font-['Teko'] uppercase text-green-500 drop-shadow-md">THE G.O.B PACK</h3>
                                <div className="flex items-center gap-4 mb-6 border-b border-green-900/50 pb-4"> <span className="bg-green-900/50 text-green-400 px-3 py-1 font-bold text-lg font-['Teko'] uppercase">FIGHTERS</span> </div>
                                <div className="grid grid-cols-3 gap-2 mb-6"> {['gob', 'wiebe', 'rbm'].map(key => { const char = CHARACTERS[key as keyof typeof CHARACTERS]; return ( <div key={key} className="relative aspect-[3/4] border-2 border-neutral-700 group-hover:border-green-500 transition-colors bg-black overflow-hidden"> <img src={ASSETS[char.profileImg as keyof typeof ASSETS]} className="w-full h-full object-cover" alt={char.name} /> <div className="absolute bottom-0 w-full bg-green-900/90 text-white text-center text-[10px] py-1 font-bold font-['Teko'] truncate uppercase">{char.name}</div> </div> ) })} </div>
                            </div>
                            {dlc1Installed ? ( 
                                <button className="w-full bg-green-900/20 text-green-500 py-4 font-black text-2xl uppercase border-4 border-green-500 cursor-default font-['Teko'] tracking-widest">OWNED</button> 
                            ) : ( 
                                <button 
                                    disabled={!isEligibleDLC1}
                                    onClick={installDLC1} 
                                    className={`w-full py-4 font-black text-3xl uppercase font-['Teko'] tracking-widest transition-all ${isEligibleDLC1 ? 'bg-green-600 hover:bg-green-500 text-black shadow-lg hover:scale-105' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                                >
                                    {isEligibleDLC1 ? 'COP DROP' : 'LOCKED'}
                                </button> 
                            )}
                        </div>

                        {/* CLOUT CHASERS */}
                        <div className={`bg-neutral-900 border-4 ${dlc2Installed ? 'border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : isEligibleDLC2 ? 'border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.3)]' : 'border-red-900/50 grayscale'} p-8 relative flex flex-col transition-all duration-300 group`}>
                             {!dlc2Installed && !isEligibleDLC2 && (
                                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border-4 border-red-600/20 uppercase">
                                    <span className="text-5xl mb-2">🔒</span>
                                    <span className="text-red-500 font-black text-2xl uppercase tracking-tighter">Restricted Access</span>
                                    <span className="text-white font-bold text-xl mt-4 bg-red-600 px-4 py-1 skew-x-[-10deg]">Requirement:</span>
                                    <span className="text-white text-3xl font-black italic mt-1 drop-shadow-md">Unlock Jelly Roll</span>
                                </div>
                            )}
                            <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl -rotate-12 shadow-lg z-20 font-['Teko'] border-4 border-black">HOT</div>
                            <div className="flex-1 relative z-10">
                                <h3 className="text-5xl text-white font-black italic mb-2 font-['Teko'] uppercase text-blue-500 drop-shadow-md">CLOUT CHASERS</h3>
                                <div className="flex items-center gap-4 mb-6 border-b border-blue-900/50 pb-4"> <span className="bg-blue-900/50 text-blue-400 px-3 py-1 font-bold text-lg font-['Teko'] uppercase">FIGHTERS</span> </div>
                                <div className="grid grid-cols-3 gap-2 mb-6"> {['cripmac', 'tekashi', 'drake'].map(key => { const char = CHARACTERS[key as keyof typeof CHARACTERS]; return ( <div key={key} className="relative aspect-[3/4] border-2 border-neutral-700 group-hover:border-blue-500 transition-colors bg-black overflow-hidden"> <img src={ASSETS[char.profileImg as keyof typeof ASSETS]} className="w-full h-full object-cover" alt={char.name} /> <div className="absolute bottom-0 w-full bg-blue-900/90 text-white text-center text-[10px] py-1 font-bold font-['Teko'] truncate uppercase">{char.name}</div> </div> ) })} </div>
                            </div>
                            {dlc2Installed ? ( 
                                <button className="w-full bg-blue-900/20 text-blue-500 py-4 font-black text-2xl uppercase border-4 border-blue-500 cursor-default font-['Teko'] tracking-widest">OWNED</button> 
                            ) : ( 
                                <button 
                                    disabled={!isEligibleDLC2}
                                    onClick={installDLC2} 
                                    className={`w-full py-4 font-black text-3xl uppercase font-['Teko'] tracking-widest transition-all ${isEligibleDLC2 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:scale-105' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                                >
                                    {isEligibleDLC2 ? 'COP DROP' : 'LOCKED'}
                                </button> 
                            )}
                        </div>

                        {/* THE VILLAGES (ARENA PACK) */}
                        <div className={`bg-neutral-900 border-4 ${dlc3Installed ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : isEligibleDLC3 ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 'border-red-900/50 grayscale'} p-8 relative flex flex-col transition-all duration-300 group`}>
                             {!dlc3Installed && !isEligibleDLC3 && (
                                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border-4 border-red-600/20 uppercase">
                                    <span className="text-5xl mb-2">🔒</span>
                                    <span className="text-red-500 font-black text-2xl uppercase tracking-tighter">Restricted Access</span>
                                    <span className="text-white font-bold text-xl mt-4 bg-red-600 px-4 py-1 skew-x-[-10deg]">Requirement:</span>
                                    <span className="text-white text-3xl font-black italic mt-1 drop-shadow-md">Unlock Biggie</span>
                                </div>
                            )}
                            <div className="absolute -top-4 -right-4 bg-yellow-500 text-black w-16 h-16 rounded-full flex items-center justify-center font-black text-xl rotate-6 shadow-lg z-20 font-['Teko'] border-4 border-black">NEW</div>
                            <div className="flex-1 relative z-10">
                                <h3 className="text-5xl text-white font-black italic mb-2 font-['Teko'] uppercase text-yellow-500 drop-shadow-md">THE VILLAGES</h3>
                                <div className="flex items-center gap-4 mb-6 border-b border-yellow-900/50 pb-4"> <span className="bg-yellow-900/50 text-yellow-400 px-3 py-1 font-bold text-lg font-['Teko'] uppercase">NEW SPOT</span> </div>
                                <div className="relative aspect-video border-2 border-neutral-700 group-hover:border-yellow-500 transition-colors bg-black overflow-hidden mb-6"> <img src={ASSETS.BG_VILLAGES} className="w-full h-full object-cover" alt="The Villages Arena" /> </div>
                                <p className="text-gray-400 font-['Teko'] text-lg leading-tight mb-4 uppercase">Fight through DKAY's old stomping grounds in Windsor, Ont Canada. Where the hustle started.</p>
                            </div>
                            {dlc3Installed ? ( 
                                <button className="w-full bg-yellow-900/20 text-yellow-500 py-4 font-black text-2xl uppercase border-4 border-yellow-500 cursor-default font-['Teko'] tracking-widest">OWNED</button> 
                            ) : ( 
                                <button 
                                    disabled={!isEligibleDLC3}
                                    onClick={installDLC3} 
                                    className={`w-full py-4 font-black text-3xl uppercase font-['Teko'] tracking-widest transition-all ${isEligibleDLC3 ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg hover:scale-105' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                                >
                                    {isEligibleDLC3 ? 'UNLOCK SPOT' : 'LOCKED'}
                                </button> 
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-neutral-900 border-t border-white/10 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-black border-4 border-white/10 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 text-9xl opacity-5 select-none pointer-events-none font-bold font-['Teko'] uppercase">WASD</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h2 className="text-5xl text-white mb-6 italic font-bold font-['Teko'] uppercase">Combat <span className="text-blue-500 font-['Permanent_Marker']">Manual</span></h2>
                                <p className="text-gray-400 text-xl mb-8 leading-relaxed font-['Teko'] uppercase"> This ain't a fair fight. Use every tool at your disposal. Master movement to dodge fire, and unleash special attacks when the meter is full. </p>
                                <div className="space-y-4 text-xl font-['Teko'] uppercase">
                                    <div className="flex items-center gap-4"> <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center border-2 border-white/20 text-yellow-500 font-bold text-2xl uppercase">W</div> <span className="text-gray-300">Move Up</span> </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1"> <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center border-2 border-white/20 text-yellow-500 font-bold text-2xl uppercase">A</div> <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center border-2 border-white/20 text-yellow-500 font-bold text-2xl uppercase">S</div> <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center border-2 border-white/20 text-yellow-500 font-bold text-2xl uppercase">D</div> </div>
                                        <span className="text-gray-300">Strafe / Back</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-6"> <div className="w-40 h-14 bg-red-900/50 flex items-center justify-center border-2 border-red-500 text-white font-bold text-2xl animate-pulse uppercase">Space</div> <span className="text-gray-300">Unleash Hell</span> </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-black py-20 flex flex-col items-center">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 cursor-pointer hover:opacity-80 transition-opacity"> <img src={ASSETS.LOGO} alt="DKAY VENDETTA" className="h-16 md:h-24 object-contain" /> </div>
                    <p className="text-4xl md:text-5xl text-gray-800 font-bold font-['Teko'] tracking-[0.5em] uppercase"> Music Money Game$ </p>
                </div>
            </footer>
        </>
      )}
    </div>
  );
};
