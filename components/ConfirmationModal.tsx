import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  requireAuth?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, requireAuth = false
}) => {
  const [inputValue, setInputValue] = useState('');
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireAuth && inputValue !== 'DELETE') return;
    onConfirm();
    setInputValue('');
  };

  const isConfirmDisabled = requireAuth && inputValue !== 'DELETE';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 backdrop-blur-lg p-4 animate-in fade-in duration-300">
      <div className="
        w-full max-w-md rounded-[2.5rem] relative overflow-hidden backdrop-blur-2xl shadow-2xl transition-all
        bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70
        border border-white/50 dark:border-white/10
      ">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-red-50/30 dark:bg-red-900/10 flex items-start gap-4">
          <div className="p-3 bg-red-100/50 dark:bg-red-900/30 rounded-full text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-800">
            {requireAuth ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
            {requireAuth && <p className="text-red-500 dark:text-red-400 text-xs font-mono mt-1 uppercase tracking-wider font-bold">Security Protocol Initiated</p>}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-red-200 dark:border-red-800 pl-4 font-medium">
            {message}
          </p>

          {requireAuth && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800">
              <label className="text-xs text-red-500 dark:text-red-400 font-bold block mb-2 uppercase tracking-wide">
                Type "DELETE" to confirm security check
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white dark:bg-black/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 transition-all font-mono backdrop-blur-sm"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50/50 dark:bg-black/20 flex gap-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-bold bg-white/50 dark:bg-gray-800/50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 py-4 rounded-xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all
              ${isConfirmDisabled 
                ? 'bg-red-200 dark:bg-red-900/40 text-white border border-red-200 dark:border-red-900/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-red-500 shadow-red-500/30 hover:shadow-red-500/50'
              }`}
          >
            {isConfirmDisabled ? <ShieldAlert size={18} /> : <Check size={18} />}
            {requireAuth ? 'Authorize' : 'Confirm'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;