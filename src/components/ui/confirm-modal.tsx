'use client';

import React, { useCallback, useEffect } from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: React.ReactNode; color: string; border: string }
> = {
  danger: {
    icon: <XCircle size={22} />,
    color: 'var(--color-danger, #ff3366)',
    border: 'rgba(255,51,102,0.25)',
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    color: 'var(--color-warning, #ffb700)',
    border: 'rgba(255,183,0,0.25)',
  },
  info: {
    icon: <Info size={22} />,
    color: 'var(--color-secondary, #00e5ff)',
    border: 'rgba(0,229,255,0.2)',
  },
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cfg = VARIANT_CONFIG[variant];

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.80)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(10,12,18,0.98)',
          border: `1px solid ${cfg.border}`,
          borderTop: `3px solid ${cfg.color}`,
          borderRadius: '8px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          animation: 'confirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <span style={{ color: cfg.color, flexShrink: 0, marginTop: '2px' }}>{cfg.icon}</span>
          <div>
            <h3
              id="confirm-title"
              style={{
                fontSize: '15px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #9ca3af)', lineHeight: '1.6' }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="cyber-btn cyber-btn-secondary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              background: cfg.color,
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmIn {
          from { transform: scale(0.92) translateY(-8px); opacity: 0; }
          to   { transform: scale(1) translateY(0);      opacity: 1; }
        }
      `}</style>
    </div>
  );
}
