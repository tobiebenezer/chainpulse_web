'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { apiFetch } from '@/lib/api-client';
import { LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      return apiFetch<{ tenant: { is_superuser: boolean; name: string }; token: string }>('/v1/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (data) => {
      if (data.tenant.is_superuser) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }
    loginMutation.mutate();
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
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>
            Multi-Tenant Webhook Failover System
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="cyber-label">Email Address</label>
            <input
              type="email"
              className="cyber-input"
              placeholder="e.g. admin@chainpulse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="cyber-label" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              className="cyber-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>

          <button
            type="submit"
            className="cyber-btn"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <span className="animate-pulse-glow">Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                Access Control
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '14px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          color: 'var(--text-muted)'
        }}>
          New platform partner?{' '}
          <Link href="/register" style={{ fontWeight: 600 }}>
            Register Tenant
          </Link>
        </div>
      </div>
    </div>
  );
}
