import React from 'react';
import { PixelSubmarineGame } from './components/PixelSubmarineGame';

export const App: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen bg-[#02050c] text-slate-100 flex flex-col items-center justify-center font-mono select-none overflow-hidden">
      <PixelSubmarineGame />
    </div>
  );
};

export default App;
