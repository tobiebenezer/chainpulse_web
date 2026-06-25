'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { apiFetch } from '@/lib/api-client';
import { UserPlus, AlertTriangle, Key, Copy, Check } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Successful registration state to show API keys
  const [apiKeys, setApiKeys] = useState<{ sandbox: string; production: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      return apiFetch<{ tenant: any; api_keys: { sandbox: string; production: string } }>('/v1/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },
    onSuccess: (data) => {
      setApiKeys(data.api_keys);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('All fields are required');
      return;
    }
    registerMutation.mutate();
  };

  const copyToClipboard = (key: string, type: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // If successfully registered, show the keys screen (Disclosed only once)
  if (apiKeys) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        position: 'relative'
      }}>
        <div className="cyber-card" style={{ maxWidth: '550px', width: '100%', padding: '40px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              background: 'var(--color-primary-glow)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: '50%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 15px var(--color-primary-glow)'
            }}>
              <Key size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 style={{ fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
              API Access Keys Generated
            </h2>
            <p style={{ color: 'var(--color-warning)', fontSize: '13px', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
              ⚠️ Make sure to copy these keys now. They will not be shown again.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '24px 0' }}>
            {/* Sandbox Key */}
            <div>
              <label className="cyber-label">Sandbox API Key (Use for local testing)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="cyber-input mono-val"
                  readOnly
                  value={apiKeys.sandbox}
                  style={{ background: 'rgba(0, 0, 0, 0.4)', color: 'var(--color-secondary)' }}
                />
                <button
                  type="button"
                  className="cyber-btn cyber-btn-secondary"
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => copyToClipboard(apiKeys.sandbox, 'sandbox')}
                >
                  {copiedKey === 'sandbox' ? <Check size={18} style={{ color: 'var(--color-primary)' }} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Production Key */}
            <div>
              <label className="cyber-label">Production API Key (Use for live webhooks)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="cyber-input mono-val"
                  readOnly
                  value={apiKeys.production}
                  style={{ background: 'rgba(0, 0, 0, 0.4)', color: 'var(--color-primary)' }}
                />
                <button
                  type="button"
                  className="cyber-btn cyber-btn-secondary"
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => copyToClipboard(apiKeys.production, 'production')}
                >
                  {copiedKey === 'production' ? <Check size={18} style={{ color: 'var(--color-primary)' }} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/login" className="cyber-btn" style={{ display: 'inline-flex', width: '100%' }}>
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="cyber-card" style={{ maxWidth: '480px', width: '100%', padding: '40px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Logo size={36} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>
            Deploy a new secure workspace instance
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
            <label className="cyber-label">Tenant / Organization Name</label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. Acme Corp Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>

          <div>
            <label className="cyber-label">Business Email</label>
            <input
              type="email"
              className="cyber-input"
              placeholder="e.g. support@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>

          <div>
            <label className="cyber-label">Dashboard Password</label>
            <input
              type="password"
              className="cyber-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>

          <button
            type="submit"
            className="cyber-btn"
            style={{ width: '100%', marginTop: '8px', background: 'linear-gradient(135deg, var(--color-secondary), #00a8cc)' }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <span className="animate-pulse-glow">Deploying Infrastructure...</span>
            ) : (
              <>
                <UserPlus size={18} />
                Deploy Instance
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
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
