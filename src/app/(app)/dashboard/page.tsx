'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboard } from './dashboard-context';
import { apiFetch } from '@/lib/api-client';
import {
  Activity,
  Layers,
  Globe,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';

interface AnalyticsSummary {
  total_transactions: number;
  active_wallets: number;
  active_webhooks: number;
  webhook_success_rate: number;
}

interface DailyStats {
  date: string;
  tx_count: number;
  webhook_success: number;
  webhook_fail: number;
}

interface UsageCounters {
  tenant_id: string;
  period_start: string;
  detected_events: number;
  delivered_webhooks: number;
  successful_webhooks: number;
  failed_webhooks: number;
}

export default function OverviewPage() {
  const { env, tenant } = useDashboard();

  // Queries
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery<{ summary: AnalyticsSummary; daily_stats: DailyStats[] }>({
    queryKey: ['analytics', env],
    queryFn: () => apiFetch<{ summary: AnalyticsSummary; daily_stats: DailyStats[] }>('/v1/dashboard/analytics'),
  });

  const { data: usageData, isLoading: loadingUsage } = useQuery<UsageCounters>({
    queryKey: ['usage'],
    queryFn: () => apiFetch<UsageCounters>('/v1/usage'),
  });

  const summary = analyticsData?.summary;
  const dailyStats = analyticsData?.daily_stats || [];

  // SVG Chart Computations
  const maxVal = Math.max(...dailyStats.map(d => d.tx_count || 1), 1);
  const chartHeight = 120;
  const chartWidth = 500;
  const points = dailyStats.map((d, i) => {
    const tx = d.tx_count || 0;
    const x = (i / Math.max(dailyStats.length - 1, 1)) * chartWidth;
    const y = chartHeight - (tx / maxVal) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = dailyStats.length > 0
    ? `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`
    : '';

  return (
    <div>
      {/* Quick Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="cyber-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--color-primary-glow)', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-primary-border)' }}>
            <TrendingUp size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Total Processed</p>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{summary?.total_transactions ?? 0}</h3>
          </div>
        </div>

        <div className="cyber-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--color-secondary-glow)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            <Layers size={24} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Active Wallets</p>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{summary?.active_wallets ?? 0}</h3>
          </div>
        </div>

        <div className="cyber-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,183,0,0.1)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,183,0,0.2)' }}>
            <Globe size={24} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Webhooks Active</p>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{summary?.active_webhooks ?? 0}</h3>
          </div>
        </div>

        <div className="cyber-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,51,102,0.1)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,51,102,0.2)' }}>
            <ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Delivery Rate</p>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--color-primary)' }}>
              {summary?.webhook_success_rate !== undefined ? `${summary.webhook_success_rate.toFixed(1)}%` : '0%'}
            </h3>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="cyber-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>7-Day Ingest Metrics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Aggregated transactions processed by block scanners</p>
          </div>
        </div>

        <div style={{ width: '100%', background: 'rgba(0, 0, 0, 0.2)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          {loadingAnalytics ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              PULLING STATS...
            </div>
          ) : dailyStats.length > 0 ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="neon-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {fillPoints && <polygon points={fillPoints} fill="url(#neon-glow)" />}
              {points && <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              
              {dailyStats.map((d, i) => {
                const tx = d.tx_count !== undefined ? d.tx_count : 0;
                const x = (i / Math.max(dailyStats.length - 1, 1)) * chartWidth;
                const y = chartHeight - (tx / maxVal) * chartHeight;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="var(--bg-void)" stroke="var(--color-primary)" strokeWidth="2" />
                    <circle cx={x} cy={y} r="10" fill="var(--color-primary)" fillOpacity="0.1" className="animate-pulse-glow" />
                  </g>
                );
              })}
            </svg>
          ) : (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              NO INGEST DATA DISPATCHED FOR CURRENT TIMELINE
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 8px' }}>
          {dailyStats.map((d, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {d.date.substring(5)}
            </span>
          ))}
        </div>
      </section>

      {/* Monthly Usage Counters */}
      <section className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage & Plan Allocations</h3>
        </div>
        
        {loadingUsage ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>QUERYING TELEMETRY DATA...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Detected Events</label>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>{usageData?.detected_events ?? 0}</h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Delivered Webhooks</label>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>{usageData?.delivered_webhooks ?? 0}</h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Successful Deliveries</label>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '8px' }}>{usageData?.successful_webhooks ?? 0}</h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Failed Deliveries</label>
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '8px' }}>{usageData?.failed_webhooks ?? 0}</h4>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
