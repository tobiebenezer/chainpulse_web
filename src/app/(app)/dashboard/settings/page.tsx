'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  CreditCard,
  AlertTriangle,
  LogOut,
  Monitor,
  Settings,
  Zap,
  ArrowRight,
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0/mo',
    color: 'var(--text-muted)',
    border: 'var(--border-color)',
    features: ['1 wallet node', '100 events/month', 'Sandbox only', 'Community support'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$49/mo',
    color: 'var(--color-primary)',
    border: 'rgba(0,255,102,0.3)',
    features: ['3 wallet nodes', '10,000 events/month', 'Production access', 'Priority support'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    color: 'var(--color-secondary)',
    border: 'rgba(0,229,255,0.3)',
    features: ['Unlimited wallets', 'Unlimited events', 'Dedicated infrastructure', 'SLA guarantee'],
  },
];

type Tab = 'security' | 'billing' | 'environment' | 'danger';

function TabBtn({ id, active, label, icon }: { id: string; active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <button
      data-tab={id}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '4px', background: 'none', border: 'none',
        color: active ? '#fff' : 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: active ? 700 : 500,
        letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        transition: 'all 0.2s',
      }}
    >
      {icon}{label}
    </button>
  );
}

export default function SettingsPage() {
  const { tenant, env, handleEnvChange, logoutMutation } = useDashboard();
  const { success, error: toastError, info } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('security');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Billing
  const [upgradePlan, setUpgradePlan] = useState(tenant.plan);

  const upgradeMutation = useMutation({
    mutationFn: (plan: string) =>
      apiFetch('/v1/billing/upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      success('Subscription plan updated successfully!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update plan');
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('All fields are required.');
      return;
    }
    if (newPwd.length < 8) {
      setPwdError('New password must be at least 8 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    // Backend endpoint not yet available — show graceful notice
    info('Password change endpoint is not yet available. Please contact support.');
  };

  const handlePlanUpgrade = () => {
    if (upgradePlan === tenant.plan) {
      info('You are already on this plan.');
      return;
    }
    upgradeMutation.mutate(upgradePlan);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'security',    label: 'Security',    icon: <Lock size={13} /> },
    { id: 'billing',     label: 'Billing',     icon: <CreditCard size={13} /> },
    { id: 'environment', label: 'Environment', icon: <Monitor size={13} /> },
    { id: 'danger',      label: 'Danger Zone', icon: <AlertTriangle size={13} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '860px' }}>

      {/* Logout confirm */}
      <ConfirmModal
        open={showLogoutModal}
        title="Terminate Session"
        message="This will log you out of your current session immediately. All unsaved work will be lost."
        confirmLabel="Terminate"
        variant="danger"
        onConfirm={() => logoutMutation.mutate()}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Page header */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={20} style={{ color: 'var(--color-primary)' }} />
          Settings
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your security credentials, subscription plan, and environment configuration.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px', borderRadius: '4px 4px 0 0',
              background: 'none', border: 'none',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: activeTab === t.id ? 700 : 500,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.18s', whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: activeTab === t.id ? 'var(--color-primary)' : 'inherit' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────── TAB: SECURITY ──────── */}
      {activeTab === 'security' && (
        <div className="cyber-card" style={{ padding: '28px', maxWidth: '480px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} style={{ color: 'var(--color-primary)' }} /> Change Password
          </h3>

          {pwdSuccess && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.2)', borderRadius: '4px', marginBottom: '20px' }}>
              <CheckCircle size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Password updated successfully.</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Current password */}
            <div>
              <label className="cyber-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="cyber-input"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="cyber-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className="cyber-input"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="cyber-label">Confirm New Password</label>
              <input
                type="password"
                className="cyber-input"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            {pwdError && <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '-4px' }}>{pwdError}</p>}

            <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
              Update Password
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Password requirements:</strong>
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              <li>At least 8 characters</li>
              <li>Recommended: mix of letters, numbers, and symbols</li>
            </ul>
          </div>
        </div>
      )}

      {/* ──────── TAB: BILLING ──────── */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.12)', borderRadius: '4px' }}>
            <Zap size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '13px', color: '#fff' }}>
              Current plan: <strong style={{ color: 'var(--color-primary)', textTransform: 'uppercase' }}>{tenant.plan}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {PLANS.map(plan => {
              const isCurrent = plan.id === tenant.plan;
              const isSelected = plan.id === upgradePlan;
              return (
                <button
                  key={plan.id}
                  onClick={() => setUpgradePlan(plan.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    padding: '20px', borderRadius: '4px', textAlign: 'left', cursor: 'pointer',
                    background: isSelected ? `rgba(${plan.id === 'pro' ? '0,255,102' : '0,229,255'},0.06)` : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${isSelected ? plan.border : 'var(--border-color)'}`,
                    transition: 'all 0.2s', outline: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: plan.color, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      {plan.label}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-primary)', background: 'rgba(0,255,102,0.1)', border: '1px solid rgba(0,255,102,0.2)', padding: '2px 8px', borderRadius: '99px' }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{plan.price}</span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <CheckCircle size={11} style={{ color: plan.color, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handlePlanUpgrade}
              disabled={upgradeMutation.isPending || upgradePlan === tenant.plan}
              className="cyber-btn"
              style={{ padding: '10px 24px' }}
            >
              {upgradeMutation.isPending ? 'Upgrading...' : 'Confirm Plan Change'}
              <ArrowRight size={14} />
            </button>
            {upgradePlan === tenant.plan && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select a different plan to make a change</span>
            )}
          </div>
        </div>
      )}

      {/* ──────── TAB: ENVIRONMENT ──────── */}
      {activeTab === 'environment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
          <div className="cyber-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={15} style={{ color: 'var(--color-primary)' }} /> Active Environment
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Switching environments changes the scope of all API calls, wallet data, and transaction logs across the entire dashboard.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['sandbox', 'production'] as const).map(e => (
                <button
                  key={e}
                  onClick={() => {
                    handleEnvChange(e);
                    success(`Switched to ${e} environment`);
                  }}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '4px', cursor: 'pointer',
                    background: env === e
                      ? (e === 'production' ? 'rgba(0,229,255,0.08)' : 'rgba(0,255,102,0.08)')
                      : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${env === e ? (e === 'production' ? 'rgba(0,229,255,0.3)' : 'rgba(0,255,102,0.3)') : 'var(--border-color)'}`,
                    color: env === e ? (e === 'production' ? 'var(--color-secondary)' : 'var(--color-primary)') : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}
                >
                  {e === 'production' ? <Zap size={18} /> : <Monitor size={18} />}
                  {e}
                  {env === e && <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>● ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 18px', background: 'rgba(255,183,0,0.04)', border: '1px solid rgba(255,183,0,0.15)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-warning)' }}>⚠ Sandbox vs Production:</strong>
            <br />Sandbox events and data are isolated from production. API keys are environment-scoped. Webhooks only receive events from their registered environment.
          </div>
        </div>
      )}

      {/* ──────── TAB: DANGER ZONE ──────── */}
      {activeTab === 'danger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '540px' }}>
          {/* Logout session */}
          <div style={{ padding: '20px 24px', background: 'rgba(255,51,102,0.04)', border: '1px solid rgba(255,51,102,0.15)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Terminate Current Session</span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Log out of your account immediately. You will need to sign in again.
              </p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '4px',
                background: 'rgba(255,51,102,0.07)', border: '1px solid rgba(255,51,102,0.25)', color: 'var(--color-danger)',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              <LogOut size={14} /> Terminate Session
            </button>
          </div>

          {/* Account closure placeholder */}
          <div style={{ padding: '20px 24px', background: 'rgba(255,51,102,0.02)', border: '1px dashed rgba(255,51,102,0.12)', borderRadius: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>Request Account Closure</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.6 }}>
              To close your ChainPulse account and delete all associated data, contact <a href="mailto:support@chainpulse.io" style={{ color: 'var(--color-secondary)' }}>support@chainpulse.io</a>. Account closures are reviewed within 3 business days and are irreversible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
