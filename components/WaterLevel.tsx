import React from 'react';
import { WaterTankState } from '../types';
import { THEME } from '../constants';
import { Settings, Droplets } from 'lucide-react';

interface WaterLevelProps {
  tankState: WaterTankState;
  lowThreshold: number;
  highThreshold: number;
  onToggleMode: () => void;
  onToggleMotor: () => void;
}

const WaterLevel: React.FC<WaterLevelProps> = ({ 
  tankState, 
  lowThreshold, 
  highThreshold, 
  onToggleMode, 
  onToggleMotor 
}) => {
  const getLevelColor = (level: number) => {
    if (level < lowThreshold) return THEME.colors.alert;
    if (level > highThreshold) return THEME.colors.danger; 
    return '#10b981'; // Emerald
  };

  return (
    <div className="
      bg-gradient-to-br from-white/60 via-white/30 to-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent 
      border border-white/40 dark:border-white/10 
      rounded-[2.5rem] p-8 relative overflow-hidden backdrop-blur-2xl shadow-glass dark:shadow-glass-dark
    ">
      
      {/* Gloss Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none opacity-40 dark:opacity-5 rounded-[2.5rem]" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-gray-800 dark:text-white font-bold flex items-center gap-3 text-lg">
            <div className="p-3 bg-white/50 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm backdrop-blur-md">
                <Droplets size={24} />
            </div>
            Water Tank
        </h3>
        <span className={`text-xs px-4 py-2 rounded-xl font-mono border font-bold backdrop-blur-md shadow-sm ${tankState.mode === 'AUTO' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-400/10 border-amber-400/30 text-amber-700 dark:text-amber-400'}`}>
            {tankState.mode}
        </span>
      </div>

      <div className="flex gap-10 h-60 relative z-10">
        {/* Visual Bar */}
        <div className="w-24 h-full bg-gray-200/30 dark:bg-gray-700/30 rounded-[1.5rem] relative overflow-hidden border border-white/40 dark:border-white/10 shadow-inner backdrop-blur-sm">
           {/* Level Fill */}
           <div 
             className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out opacity-90 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
             style={{ 
                 height: `${tankState.level}%`, 
                 backgroundColor: getLevelColor(tankState.level),
             }}
           />
           
           {/* Bubbles / Liquid Texture */}
           <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100%_15px] opacity-30" />
           <div className="absolute bottom-0 w-full h-4 bg-white/30 blur-md" style={{ bottom: `${tankState.level - 2}%` }}></div>

           {/* Markers */}
           <div className="absolute w-full border-t-2 border-dashed border-red-400/60 text-[10px] text-red-500 font-black right-0 px-2 text-right" style={{ bottom: `${highThreshold}%` }}>MAX</div>
           <div className="absolute w-full border-t-2 border-dashed border-amber-400/60 text-[10px] text-amber-500 font-black right-0 px-2 text-right" style={{ bottom: `${lowThreshold}%` }}>MIN</div>
           
           {/* Percentage Text */}
           <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-800 z-10 font-mono text-2xl drop-shadow-md mix-blend-overlay">
               {Math.round(tankState.level)}%
           </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col justify-between">
           <div className="space-y-4">
               <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 font-mono bg-white/40 dark:bg-white/5 p-4 rounded-2xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                   <span>Motor Status</span>
                   <span className={`px-2 py-1 rounded-md text-xs ${tankState.isMotorOn ? 'bg-emerald-400 text-white shadow-neon' : 'text-gray-400 dark:text-gray-500'}`}>
                       {tankState.isMotorOn ? 'RUNNING' : 'STOPPED'}
                   </span>
               </div>
               {tankState.level < lowThreshold && (
                   <div className="text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 animate-pulse font-bold bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                       <Settings size={14} /> Low Water Level
                   </div>
               )}
               {tankState.level > highThreshold && (
                   <div className="text-red-700 dark:text-red-400 text-xs flex items-center gap-2 animate-pulse font-bold bg-red-100/50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                       <Settings size={14} /> Tank Overflow Risk
                   </div>
               )}
           </div>

           <div className="space-y-4">
               <button 
                onClick={onToggleMotor}
                disabled={tankState.mode === 'AUTO'}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg tracking-wide backdrop-blur-md border ${
                   tankState.isMotorOn 
                    ? 'bg-gradient-to-r from-red-500/80 to-red-400/80 text-white border-red-400/50 hover:shadow-red-500/30' 
                    : 'bg-gradient-to-r from-emerald-500/80 to-emerald-400/80 text-white border-emerald-400/50 hover:shadow-emerald-500/30'
                } ${tankState.mode === 'AUTO' ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02]'}`}>
                   {tankState.isMotorOn ? 'STOP MOTOR' : 'START MOTOR'}
               </button>

               <button 
                 onClick={onToggleMode}
                 className="w-full py-3 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl text-xs text-gray-600 dark:text-gray-400 border border-white/40 dark:border-white/10 transition-all uppercase tracking-widest font-bold backdrop-blur-md">
                   Switch to {tankState.mode === 'AUTO' ? 'Manual' : 'Auto'}
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevel;