import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl border-t border-white/40 dark:border-white/10 z-50 flex items-center px-6 shadow-glass-dark">
      <div className="text-xs font-black text-gray-400 mr-4 uppercase tracking-widest flex items-center gap-2">
         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
         System Log
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 flex items-center space-x-8 overflow-x-auto no-scrollbar whitespace-nowrap mask-gradient-light"
      >
        {logs.length === 0 && <span className="text-gray-400 dark:text-gray-600 text-xs italic">System initialized. Waiting for events...</span>}
        
        {logs.map((log) => (
          <div key={log.id} className="flex items-center space-x-2 text-xs opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-gray-400 dark:text-gray-500 font-mono">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}]</span>
            {log.type === 'info' && <Info size={14} className="text-blue-500" />}
            {log.type === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
            {log.type === 'alert' && <AlertCircle size={14} className="text-amber-500" />}
            {log.type === 'error' && <XCircle size={14} className="text-red-500" />}
            <span className={`font-semibold tracking-wide
               ${log.type === 'error' ? 'text-red-600 dark:text-red-400' : ''}
               ${log.type === 'alert' ? 'text-amber-600 dark:text-amber-400' : ''}
               ${log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'}
            `}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;