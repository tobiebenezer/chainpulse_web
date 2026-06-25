'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Activity,
  User,
  Key,
  ShieldAlert
} from 'lucide-react';

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  description: string;
  created_at: string;
}

export default function SecurityLedger() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  // Queries
  const { data: auditLogsData, isLoading } = useQuery<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ['admin_audit_logs_page', page],
    queryFn: () => apiFetch<{ logs: AuditLog[]; total: number; page: number; limit: number }>(`/v1/admin/audit-logs?page=${page}&limit=10`),
  });

  const rawLogs = auditLogsData?.logs || [];
  const totalItems = auditLogsData?.total || 0;
  const totalPages = Math.ceil(totalItems / 10) || 1;

  // Filter logs on client side for finer controls
  const filteredLogs = rawLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.actor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.target_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  // Helper to choose badge color for audit actions
  const getActionBadgeStyle = (action: string) => {
    if (action.includes('kyb')) {
      return {
        background: 'rgba(255, 183, 0, 0.05)',
        border: '1px solid rgba(255, 183, 0, 0.2)',
        color: 'var(--color-warning)'
      };
    }
    if (action.includes('status') || action.includes('suspend') || action.includes('block')) {
      return {
        background: 'rgba(255, 51, 102, 0.05)',
        border: '1px solid rgba(255, 51, 102, 0.2)',
        color: 'var(--color-danger)'
      };
    }
    return {
      background: 'rgba(0, 255, 102, 0.05)',
      border: '1px solid var(--color-primary-border)',
      color: 'var(--color-primary)'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          Security Ledger
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time, immutable record of administrative actions, compliance reviews, and key generation cycles.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '280px', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search description, actor UUID, target ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 36px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>

        {/* Action Type Filter */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">All Actions</option>
              <option value="kyb_review">KYB Reviews</option>
              <option value="tenant_status_update">Status Updates</option>
              <option value="tenant_plan_update">Plan Updates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="cyber-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Type</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actor</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  RETRIEVING SECURITY DEEDS...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No security events found in the ledger.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const badgeStyle = getActionBadgeStyle(log.action);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        ...badgeStyle
                      }}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {log.target_type.toUpperCase()}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#f1f5f9', lineHeight: 1.4 }}>
                      {log.description}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} title={log.actor_id}>
                      {log.actor_id.slice(0, 8)}...
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing page <strong>{page}</strong> of {totalPages} ({totalItems} records total)
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              color: page === 1 ? 'var(--text-muted)' : '#fff',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              color: page === totalPages ? 'var(--text-muted)' : '#fff',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
