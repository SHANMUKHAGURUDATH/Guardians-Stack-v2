import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  notify: (type: ToastType, title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, description }]);
      window.setTimeout(() => {
        dismiss(id);
      }, 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const styles = {
            success: {
              border: 'border-emerald-700/80 bg-slate-900/95',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
              badge: 'text-emerald-300',
            },
            error: {
              border: 'border-rose-700/80 bg-slate-900/95',
              icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
              badge: 'text-rose-300',
            },
            warning: {
              border: 'border-amber-700/80 bg-slate-900/95',
              icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
              badge: 'text-amber-300',
            },
            info: {
              border: 'border-cyan-700/80 bg-slate-900/95',
              icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
              badge: 'text-cyan-300',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border ${styles.border} p-3.5 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 transition-all`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {styles.icon}
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${styles.badge}`}>{toast.title}</p>
                  {toast.description && (
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors shrink-0"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
