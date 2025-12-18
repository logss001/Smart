import React from 'react';
import { Device, DeviceType } from '../types';
import { Power, Sun, Fan, AlertTriangle, Trash2, Lock } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string) => void;
  onChangeValue: (id: string, value: number) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onChangeValue, onDelete, disabled = false }) => {
  const isFaulty = device.isFaulty;

  return (
    <div className={`
      relative p-6 rounded-[2rem] backdrop-blur-2xl transition-all duration-500 group overflow-hidden
      border
      ${isFaulty 
        ? 'border-red-300/50 dark:border-red-900/50 bg-gradient-to-br from-red-50/80 to-red-100/20 dark:from-red-900/20 dark:to-transparent shadow-glass' 
        : 'border-white/40 dark:border-white/10 bg-gradient-to-br from-white/60 via-white/30 to-white/10 dark:from-white/10 dark:via-white/5 dark:to-transparent shadow-glass dark:shadow-glass-dark hover:shadow-xl hover:scale-[1.02]'
      }
      ${device.isOn && !isFaulty ? 'shadow-neon border-emerald-400/30 dark:border-emerald-500/30' : ''}
      ${disabled ? 'opacity-70 grayscale-[0.5]' : ''}
      flex flex-col justify-between min-h-[200px]
    `}>
      {/* Gloss Reflection Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-50 dark:opacity-10 rounded-[2rem]" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-4 rounded-2xl transition-all duration-500 backdrop-blur-md border ${
          device.isOn 
            ? 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 border-emerald-400/30' 
            : 'bg-gray-100/30 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 border-white/20 dark:border-white/5'
        }`}>
          {device.type === DeviceType.LIGHT && <Sun size={26} className={device.isOn ? 'animate-pulse' : ''} />}
          {device.type === DeviceType.FAN && <Fan size={26} className={device.isOn && !disabled ? 'animate-spin' : ''} />}
          {device.type === DeviceType.MOTOR && <div className="text-xs font-black font-mono tracking-tighter">PUMP</div>}
        </div>
        
        <div className="flex gap-2 items-center">
           {isFaulty && <AlertTriangle className="text-red-500 animate-pulse drop-shadow-md" size={22} />}
           
           <button onClick={() => onDelete(device.id)} className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors backdrop-blur-sm">
             <Trash2 size={18} />
           </button>
           
           {disabled && <Lock size={16} className="text-gray-400" title="Manual Mode (Read Only)" />}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 relative z-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight drop-shadow-sm">{device.name}</h3>
        <p className={`text-xs font-mono mt-1 font-bold tracking-wide ${device.isOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {isFaulty ? 'MALFUNCTION' : device.isOn ? 'ONLINE' : 'OFFLINE'}
        </p>
      </div>

      {/* Controls */}
      <div className={`mt-6 flex items-center justify-between ${disabled ? 'pointer-events-none grayscale opacity-50' : ''} relative z-10`}>
        {device.type === DeviceType.LIGHT && device.isOn && (
          <input
            type="range"
            min="0"
            max="100"
            value={device.value}
            onChange={(e) => onChangeValue(device.id, parseInt(e.target.value))}
            className="w-24 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-emerald-500 backdrop-blur-sm"
          />
        )}

        {device.type === DeviceType.FAN && device.isOn && (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(speed => (
                    <button 
                        key={speed}
                        onClick={() => onChangeValue(device.id, speed)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all backdrop-blur-md ${device.value === speed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-white/30 dark:bg-white/5 text-gray-500 hover:bg-white/50 dark:hover:bg-white/10'}`}
                    >
                        {speed}
                    </button>
                ))}
            </div>
        )}

        <button
          onClick={() => onToggle(device.id)}
          disabled={disabled}
          className={`ml-auto w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${
            device.isOn 
              ? 'bg-gradient-to-br from-emerald-400/20 to-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 hover:scale-105 border-emerald-400/40' 
              : 'bg-white/30 dark:bg-white/5 text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-gray-600 border-white/20 dark:border-white/5'
          }`}
        >
          <Power size={22} />
        </button>
      </div>
    </div>
  );
};

export default DeviceCard;