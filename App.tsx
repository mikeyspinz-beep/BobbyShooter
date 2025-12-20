import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { LandingPage } from './components/LandingPage';

type AppState = 'LANDING' | 'GAME';

function App() {
  const [appState, setAppState] = useState<AppState>('LANDING');

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {appState === 'LANDING' && (
        <LandingPage onPlay={() => setAppState('GAME')} />
      )}
      
      {appState === 'GAME' && (
        <div className="h-full w-full flex items-center justify-center bg-black p-4 md:p-8">
           <GameCanvas onExit={() => setAppState('LANDING')} />
        </div>
      )}
    </div>
  );
}

export default App;