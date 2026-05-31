import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmationDialogProps) {
  
  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Heavy, Eye-safe frosted Backdrop overlay with simple fade animation */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs animate-fade-in transition-all"
        onClick={onCancel}
      />
      
      {/* Branded Dialog Window wrapper */}
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all duration-200 animate-scale-up"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        {/* Top Header section */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span id="confirm-dialog-title" className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {title}
            </span>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message / Dialog Body */}
        <div className="p-6">
          <p id="confirm-dialog-description" className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
            {message}
          </p>
          <div className="mt-3 text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            🛡️ Security Confirmation Required
          </div>
        </div>

        {/* Footer actions row */}
        <div className="flex items-center justify-end space-x-3 p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
          >
            {cancelLabel}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-bold rounded-lg text-xs transition focus:ring-2 focus:outline-hidden ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-200 dark:shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm shadow-blue-200 dark:shadow-none'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
