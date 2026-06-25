'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ─── Toast Item ───────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    color: 'var(--color-primary)',
    bg: 'rgba(255, 51, 102, 0.08)',
    border: 'var(--color-primary-border)',
  },
  error: {
    icon: <XCircle size={16} />,
    color: 'var(--color-danger, #ff3366)',
    bg: 'rgba(255, 51, 102, 0.08)',
    border: 'rgba(255, 51, 102, 0.3)',
  },
  info: {
    icon: <Info size={16} />,
    color: 'var(--color-secondary, #00e5ff)',
    bg: 'rgba(0, 229, 255, 0.06)',
    border: 'rgba(0, 229, 255, 0.2)',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    color: 'var(--color-warning, #ffb700)',
    bg: 'rgba(255, 183, 0, 0.08)',
    border: 'rgba(255, 183, 0, 0.3)',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const cfg = VARIANT_CONFIG[toast.variant];

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  // Auto-dismiss
  useEffect(() => {
    const dur = toast.duration ?? 4000;
    const t = setTimeout(dismiss, dur);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: 'rgba(10, 12, 18, 0.95)',
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: '6px',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
        minWidth: '280px',
        maxWidth: '400px',
        color: '#fff',
        fontSize: '13px',
        lineHeight: '1.5',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
        cursor: 'default',
      }}
    >
      <span style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }}>{cfg.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted, #6b7280)',
          cursor: 'pointer',
          padding: '0',
          flexShrink: 0,
          marginTop: '1px',
          lineHeight: 1,
          outline: 'none',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = `toast-${++counter.current}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  const success = useCallback((m: string, d?: number) => toast(m, 'success', d), [toast]);
  const error   = useCallback((m: string, d?: number) => toast(m, 'error', d),   [toast]);
  const info    = useCallback((m: string, d?: number) => toast(m, 'info', d),    [toast]);
  const warning = useCallback((m: string, d?: number) => toast(m, 'warning', d), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Toast stack — bottom-right, fixed, z above everything */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 99999,
          pointerEvents: toasts.length > 0 ? 'auto' : 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}
