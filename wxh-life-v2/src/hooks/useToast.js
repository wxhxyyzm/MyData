import { createContext, createElement, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, duration = 1800) => {
    window.clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message });
    timerRef.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const value = useMemo(() => ({ toast, showToast }), [showToast, toast]);

  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
