import React from 'react';
import { Room } from '../types';
import * as Icons from 'lucide-react';

interface RoomTabsProps {
  rooms: Room[];
  activeRoomId: string;
  onSelectRoom: (id: string) => void;
  onAddRoom: () => void;
  onDeleteRoom: (id: string) => void;
}

const RoomTabs: React.FC<RoomTabsProps> = ({ rooms, activeRoomId, onSelectRoom, onAddRoom, onDeleteRoom }) => {
  return (
    <div className="flex items-center space-x-4 overflow-x-auto pb-4 pt-2 no-scrollbar px-1 relative z-20">
      {rooms.map((room) => {
        // Dynamic icon rendering
        // @ts-ignore - Lucide icons are accessed by string key
        const IconComponent = Icons[room.icon as keyof typeof Icons] || Icons.Box;
        const isActive = activeRoomId === room.id;

        return (
          <div key={room.id} className="relative group">
            <button
                onClick={() => onSelectRoom(room.id)}
                className={`
                flex items-center space-x-2 px-6 py-4 rounded-[1.5rem] transition-all duration-300 whitespace-nowrap border pr-12 backdrop-blur-xl shadow-sm
                ${isActive 
                    ? 'bg-gradient-to-r from-emerald-400/20 to-emerald-300/10 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/10 scale-105 border-emerald-400/30 dark:border-emerald-500/30' 
                    : 'bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-200 border-white/30 dark:border-white/10'
                }
                `}
            >
                <IconComponent size={18} className={isActive ? 'drop-shadow-md' : ''} />
                <span className="font-semibold tracking-wide">{room.name}</span>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoom(room.id);
                }}
                className={`absolute top-0 right-1 h-full w-10 flex items-center justify-center rounded-r-[1.5rem] transition-all z-10
                  ${isActive 
                    ? 'text-emerald-600/50 dark:text-emerald-400/50 hover:text-red-500' 
                    : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500'
                  }`}
                title="Delete Room"
            >
                <Icons.X size={14} />
            </button>
          </div>
        );
      })}
      
      <button
        onClick={onAddRoom}
        className="flex items-center justify-center min-w-[60px] h-[60px] rounded-[1.5rem] bg-white/20 dark:bg-white/5 text-gray-400 hover:bg-white/30 dark:hover:bg-white/10 hover:text-emerald-500 transition-colors border border-dashed border-white/40 dark:border-white/20 backdrop-blur-md shadow-sm"
        title="Add Room"
      >
        <Icons.Plus size={24} />
      </button>
    </div>
  );
};

export default RoomTabs;