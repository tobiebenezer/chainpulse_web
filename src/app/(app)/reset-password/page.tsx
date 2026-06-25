'use client';

import React, { useState, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { apiFetch } from '@/lib/api-client';
import { KeyRound, ArrowLeft, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      setSuccessMsg('');
      return apiFetch<{ success: boolean; message: string }>('/v1/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });
    },
    onSuccess: () => {
      setSuccessMsg('Your password has been successfully updated.');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Reset failed. Verify your token is correct and not expired.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Reset token is required');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    resetMutation.mutate();
  };

  return (
    <div className="cyber-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <Logo size={36} />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
          Change Secure Access Password
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

          <Link href="/login" className="cyber-btn" style={{ width: '100%' }}>
            <ShieldCheck size={18} /> Proceed to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="cyber-label">One-Time Reset Token</label>
            <input
              type="text"
              className="cyber-input mono-val"
              placeholder="Paste token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={resetMutation.isPending}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label className="cyber-label">New Password</label>
            <input
              type="password"
              className="cyber-input"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resetMutation.isPending}
            />
          </div>

          <div>
            <label className="cyber-label">Confirm New Password</label>
            <input
              type="password"
              className="cyber-input"
              placeholder="Verify password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={resetMutation.isPending}
            />
          </div>

          <button
            type="submit"
            className="cyber-btn"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              <span className="animate-pulse-glow">Updating Password...</span>
            ) : (
              <>
                <KeyRound size={18} />
                Set New Password
              </>
            )}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '8px' }}>
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      position: 'relative'
    }}>
      <Suspense fallback={
        <div className="cyber-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading Form Context...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
