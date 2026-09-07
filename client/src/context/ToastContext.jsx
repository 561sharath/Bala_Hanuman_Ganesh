import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Glassmorphic Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-surface-container/90 border-tertiary/40 text-on-surface'
                : toast.type === 'error'
                ? 'bg-error-container/90 border-error/50 text-on-error-container'
                : 'bg-surface-container-high/90 border-outline/40 text-on-surface'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-tertiary flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-primary flex-shrink-0" />}

            <span className="text-sm font-medium flex-1">{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-bright/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
