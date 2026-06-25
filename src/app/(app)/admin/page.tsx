'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import {
  Users,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  kyb_status: string;
  is_superuser: boolean;
  created_at: string;
}

interface KYBProfile {
  id: string;
  status: string;
}

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  description: string;
  created_at: string;
}

export default function AdminDashboardOverview() {
  // Queries with small limits to fetch counts and recent items
  const { data: tenantsData, isLoading: loadingTenants } = useQuery<PaginatedResponse<Tenant>>({
    queryKey: ['admin_tenants_overview'],
    queryFn: () => apiFetch<PaginatedResponse<Tenant>>('/v1/admin/tenants?limit=100'),
  });

  const { data: kybData, isLoading: loadingKyb } = useQuery<PaginatedResponse<KYBProfile>>({
    queryKey: ['admin_kyb_overview'],
    queryFn: () => apiFetch<PaginatedResponse<KYBProfile>>('/v1/admin/kyb?limit=100'),
  });

  const { data: auditData, isLoading: loadingAudit } = useQuery<{
    logs: AuditLog[];
    total: number;
  }>({
    queryKey: ['admin_audit_overview'],
    queryFn: () => apiFetch<{ logs: AuditLog[]; total: number }>('/v1/admin/audit-logs?limit=5'),
  });

  const totalTenants = tenantsData?.total || 0;
  const tenants = tenantsData?.data || [];
  
  // Calculate ratios from loaded dataset (up to 100 items)
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;
  
  // Compliance queue counts
  const pendingReviews = kybData?.data?.filter(p => p.status === 'pending').length || 0;
  const totalReviews = kybData?.total || 0;

  const totalAuditLogs = auditData?.total || 0;
  const recentLogs = auditData?.logs || [];

  const isSystemLoading = loadingTenants || loadingKyb || loadingAudit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Title & Context */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          System Overview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time platform telemetry, compliance management, and allocations audit ledger.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {/* Card 1: Tenants */}
        <div className="cyber-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Total Tenants
              </span>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
                {isSystemLoading ? '...' : totalTenants}
              </h3>
            </div>
            <div style={{ background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: '4px', padding: '10px' }}>
              <Users size={20} style={{ color: 'var(--color-secondary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--color-primary)' }}>{activeTenants}</strong> Active</span>
            <span>•</span>
            <span><strong style={{ color: 'var(--color-danger)' }}>{suspendedTenants}</strong> Suspended</span>
          </div>
        </div>

        {/* Card 2: Compliance */}
        <div className="cyber-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                KYB Review Queue
              </span>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: pendingReviews > 0 ? 'var(--color-warning)' : '#fff', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
                {isSystemLoading ? '...' : pendingReviews}
              </h3>
            </div>
            <div style={{
              background: pendingReviews > 0 ? 'rgba(255, 183, 0, 0.05)' : 'rgba(0, 255, 102, 0.05)',
              border: pendingReviews > 0 ? '1px solid rgba(255, 183, 0, 0.15)' : '1px solid rgba(0, 255, 102, 0.15)',
              borderRadius: '4px',
              padding: '10px'
            }}>
              <ShieldCheck size={20} style={{ color: pendingReviews > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: '#fff' }}>{totalReviews}</strong> Total Profiles</span>
            <span>•</span>
            <span>{pendingReviews > 0 ? 'Requires Action' : 'Fully Compliant'}</span>
          </div>
        </div>

        {/* Card 3: Security Ledger */}
        <div className="cyber-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Audit Actions
              </span>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
                {isSystemLoading ? '...' : totalAuditLogs}
              </h3>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
              <BookOpen size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Immutable Trail Logs</span>
          </div>
        </div>

        {/* Card 4: Webhook Dispatch Success */}
        <div className="cyber-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Failover Health
              </span>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
                100.0%
              </h3>
            </div>
            <div style={{ background: 'rgba(0, 255, 102, 0.05)', border: '1px solid var(--color-primary-border)', borderRadius: '4px', padding: '10px' }}>
              <Activity size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--color-primary)' }}>Automatic Retry Enabled</span>
          </div>
        </div>
      </div>

      {/* Warning/Alert Banner if KYB is Pending */}
      {pendingReviews > 0 && (
        <div style={{
          background: 'rgba(255, 183, 0, 0.05)',
          border: '1px solid rgba(255, 183, 0, 0.15)',
          borderRadius: '4px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Compliance review backlog alert
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              There are {pendingReviews} pending KYB verification profile(s) awaiting validation. Tenants cannot access production credentials until reviewed.
            </p>
          </div>
          <Link
            href="/admin/kyb"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Go to compliance</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Two Column Section Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '24px' }}>
        {/* Column 1: Recent Activity Logs */}
        <div className="cyber-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Security Event Trail</span>
            </h4>
            <Link
              href="/admin/audit-logs"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View full ledger</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isSystemLoading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                LOADING LEDGER...
              </div>
            ) : recentLogs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent activities logged.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: log.action.includes('kyb') ? 'var(--color-warning)' : 'var(--color-primary)'
                    }}>
                      {log.action.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.4 }}>
                    {log.description}
                  </p>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    ACTOR: {log.actor_id}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Module Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Module Index
            </h4>

            {/* Quick Link 1 */}
            <Link
              href="/admin/tenants"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'inherit'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-secondary)';
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.03)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={18} style={{ color: 'var(--color-secondary)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', display: 'block' }}>
                    Tenant Directory
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Plans, status lifecycles & allocations
                  </span>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-secondary)' }} />
            </Link>

            {/* Quick Link 2 */}
            <Link
              href="/admin/kyb"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'inherit'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.background = 'rgba(0, 255, 102, 0.03)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', display: 'block' }}>
                    Compliance Queue
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    KYB reviews & risk validation
                  </span>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
            </Link>

            {/* Quick Link 3 */}
            <Link
              href="/admin/audit-logs"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'inherit'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-muted)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', display: 'block' }}>
                    Audit Ledger
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Security logs and system actions
                  </span>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
