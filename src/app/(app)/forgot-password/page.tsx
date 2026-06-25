'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { apiFetch } from '@/lib/api-client';
import { KeyRound, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const forgotMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      setSuccessMsg('');
      return apiFetch<{ success: boolean; message: string }>('/v1/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || 'If an account exists for this email, a reset token has been sent.');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Request failed. Please check the email and try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    forgotMutation.mutate();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="cyber-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Logo size={36} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
            Request Password Reset Link
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'var(--color-danger-glow)',
            border: '1px solid var(--color-danger)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--color-danger)',
            fontSize: '14px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{
              background: 'var(--color-primary-glow)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-primary)',
              fontSize: '14px'
            }}>
              <CheckCircle size={24} style={{ color: 'var(--color-primary)' }} />
              <span>{successMsg}</span>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              If emails are simulated on your local server instance, check the console output or the background worker logs to find the secret token.
            </p>

            <Link href="/reset-password" className="cyber-btn" style={{ width: '100%' }}>
              <KeyRound size={18} /> Enter Reset Token
            </Link>

            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', marginTop: '8px' }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="cyber-label">Account Email Address</label>
              <input
                type="email"
                className="cyber-input"
                placeholder="e.g. admin@chainpulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotMutation.isPending}
              />
            </div>

            <button
              type="submit"
              className="cyber-btn"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending ? (
                <span className="animate-pulse-glow">Generating Token...</span>
              ) : (
                <>
                  <KeyRound size={18} />
                  Reset Password
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '8px' }}>
              <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
              
              <Link href="/reset-password" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                Have a token?
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
