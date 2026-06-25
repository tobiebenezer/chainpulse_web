'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Cpu,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Key,
  Zap,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface UsageCounter {
  id: string;
  tenant_id: string;
  period_start: string;
  detected_events: number;
  delivered_webhooks: number;
  successful_webhooks: number;
  failed_webhooks: number;
}

interface UsageResponse {
  data: UsageCounter[];
  total: number;
  page: number;
  limit: number;
}

const KYB_STATUS_MAP = {
  unverified: {
    icon: ShieldX,
    color: 'var(--color-danger)',
    bg: 'rgba(255,51,102,0.06)',
    border: 'rgba(255,51,102,0.2)',
    label: 'UNVERIFIED',
    message: 'Your account has not started KYB verification. Submit your profile to enable production access.',
  },
  pending: {
    icon: Clock,
    color: 'var(--color-warning)',
    bg: 'rgba(255,183,0,0.06)',
    border: 'rgba(255,183,0,0.2)',
    label: 'UNDER REVIEW',
    message: 'Your KYB submission is being reviewed by our compliance team. Production access will be enabled once verified.',
  },
  verified: {
    icon: CheckCircle,
    color: 'var(--color-primary)',
    bg: 'rgba(0,255,102,0.06)',
    border: 'rgba(0,255,102,0.2)',
    label: 'VERIFIED',
    message: 'Your KYB profile has been approved. You have full production access.',
  },
  rejected: {
    icon: XCircle,
    color: 'var(--color-danger)',
    bg: 'rgba(255,51,102,0.06)',
    border: 'rgba(255,51,102,0.2)',
    label: 'REJECTED',
    message: 'Your KYB application was not approved. Please contact support or re-submit with updated information.',
  },
};

const PLAN_META: Record<string, { color: string; label: string; limit: string }> = {
  starter:    { color: 'var(--text-muted)',      label: 'Starter',    limit: '1 wallet • 100 events/mo' },
  free:       { color: 'var(--text-muted)',      label: 'Free',       limit: '1 wallet • 100 events/mo' },
  pro:        { color: 'var(--color-primary)',   label: 'Pro',        limit: '3 wallets • 10k events/mo' },
  enterprise: { color: 'var(--color-secondary)', label: 'Enterprise', limit: 'Unlimited wallets & events' },
};

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: accent || '#fff', letterSpacing: '-0.02em' }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

export default function ProfilePage() {
  const { tenant, kybData, setShowKybModal } = useDashboard();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: usageData } = useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: () => apiFetch<UsageResponse>('/v1/usage?limit=3'),
  });

  const copyId = () => {
    navigator.clipboard.writeText(tenant.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Tenant ID copied to clipboard');
  };

  const planMeta = PLAN_META[tenant.plan] || PLAN_META['free'];
  const kybStatus = KYB_STATUS_MAP[tenant.kyb_status as keyof typeof KYB_STATUS_MAP] || KYB_STATUS_MAP.unverified;
  const KybIcon = kybStatus.icon;

  // Aggregate usage totals across fetched periods
  const usageList = usageData?.data ?? [];
  const totalDetected  = usageList.reduce((s, u) => s + u.detected_events, 0);
  const totalDelivered = usageList.reduce((s, u) => s + u.delivered_webhooks, 0);
  const totalSuccess   = usageList.reduce((s, u) => s + u.successful_webhooks, 0);
  const totalFailed    = usageList.reduce((s, u) => s + u.failed_webhooks, 0);
  const deliveryRate   = totalDelivered > 0 ? Math.round((totalSuccess / totalDelivered) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>

      {/* ── Page header ── */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          Account Profile
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Your tenant identity, compliance status, and platform usage overview.
        </p>
      </div>

      {/* ── Identity card ── */}
      <div className="cyber-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar orb */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 40% 40%, rgba(0,255,102,0.15), rgba(0,229,255,0.05))',
            border: '2px solid var(--color-primary-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,255,102,0.1)',
          }}>
            <User size={32} style={{ color: 'var(--color-primary)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
              {tenant.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tenant.email}</span>
            </div>

            {/* Tenant ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                TENANT ID
              </span>
              <button
                onClick={copyId}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px', whiteSpace: 'nowrap' }}>
                  {tenant.id}
                </span>
                <span style={{ color: copied ? 'var(--color-primary)' : 'var(--text-muted)', fontSize: '10px', marginLeft: '4px' }}>
                  {copied ? '✓ Copied' : '⧉ Copy'}
                </span>
              </button>
            </div>

            {/* Badge row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {/* Plan badge */}
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: planMeta.color,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${planMeta.color}`,
              }}>
                {planMeta.label} Plan
              </span>

              {/* Role badge */}
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--color-secondary)', border: '1px solid rgba(0,229,255,0.2)',
                background: 'rgba(0,229,255,0.05)',
              }}>
                {(tenant as any).role || 'admin'}
              </span>

              {/* Status badge */}
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: tenant.status === 'active' ? 'var(--color-primary)' : 'var(--color-warning)',
                border: `1px solid ${tenant.status === 'active' ? 'var(--color-primary-border)' : 'rgba(255,183,0,0.2)'}`,
                background: tenant.status === 'active' ? 'rgba(0,255,102,0.05)' : 'rgba(255,183,0,0.05)',
              }}>
                {tenant.status}
              </span>
            </div>
          </div>

          {/* Plan limit info */}
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', minWidth: '160px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Plan Limits</span>
            <p style={{ fontSize: '12px', color: '#fff', marginTop: '6px', lineHeight: 1.6 }}>{planMeta.limit}</p>
            <Link href="/dashboard/billing" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none' }}>
              <span>Upgrade plan</span><ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── KYB Compliance status ── */}
      <div className="cyber-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
          KYB Compliance
        </h4>
        <div style={{
          display: 'flex', gap: '16px', alignItems: 'flex-start',
          background: kybStatus.bg, border: `1px solid ${kybStatus.border}`,
          borderRadius: '4px', padding: '16px 20px',
        }}>
          <KybIcon size={22} style={{ color: kybStatus.color, flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: kybStatus.color }}>
                {kybStatus.label}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{kybStatus.message}</p>
            {(tenant.kyb_status === 'unverified' || tenant.kyb_status === 'rejected') && (
              <button
                onClick={() => setShowKybModal(true)}
                className="cyber-btn"
                style={{ marginTop: '12px', padding: '8px 16px', fontSize: '12px' }}
              >
                <Shield size={13} /> {tenant.kyb_status === 'rejected' ? 'Re-submit KYB Profile' : 'Submit KYB Profile'}
              </button>
            )}
            {kybData?.profile?.reviewed_at && (
              <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                REVIEWED: {new Date(kybData.profile.reviewed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Usage Statistics ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
            Platform Usage (Last 3 Periods)
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {usageList.length > 0 ? `${usageList[usageList.length - 1]?.period_start} → now` : 'current period'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <StatCard label="Detected Events"    value={totalDetected}  sub="blockchain events ingested" accent="var(--color-secondary)" />
          <StatCard label="Webhooks Fired"     value={totalDelivered} sub="delivery attempts made" />
          <StatCard label="Successful"         value={totalSuccess}   sub="confirmed deliveries" accent="var(--color-primary)" />
          <StatCard label="Failed"             value={totalFailed}    sub="delivery errors" accent={totalFailed > 0 ? 'var(--color-danger)' : undefined} />
          <StatCard label="Delivery Rate"      value={`${deliveryRate}%`} sub="success percentage" accent={deliveryRate >= 90 ? 'var(--color-primary)' : 'var(--color-warning)'} />
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="cyber-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Quick Access
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { href: '/dashboard/api-keys',    icon: Key,      label: 'API Credentials' },
            { href: '/dashboard/wallets',     icon: Cpu,      label: 'Wallet Nodes' },
            { href: '/dashboard/webhooks',    icon: Radio,    label: 'Webhooks' },
            { href: '/dashboard/billing',     icon: Zap,      label: 'Billing' },
            { href: '/dashboard/transactions',icon: Activity, label: 'Transactions' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s', fontSize: '13px' }}>
              <Icon size={14} style={{ color: 'var(--color-primary)' }} />
              <span>{label}</span>
              <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
