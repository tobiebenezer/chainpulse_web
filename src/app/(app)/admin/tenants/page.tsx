'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  Briefcase,
  Terminal,
  Activity,
  Globe
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

export default function TenantDirectory() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Drawer states
  const [activeDrawerTenant, setActiveDrawerTenant] = useState<Tenant | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Queries
  const { data: tenantsData, isLoading } = useQuery<PaginatedResponse<Tenant>>({
    queryKey: ['admin_tenants_page', page],
    queryFn: () => apiFetch<PaginatedResponse<Tenant>>(`/v1/admin/tenants?page=${page}&limit=10`),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
      return apiFetch(`/v1/admin/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tenants_page'] });
      queryClient.invalidateQueries({ queryKey: ['admin_tenants_overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_overview'] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: 'free' | 'pro' | 'enterprise' }) => {
      return apiFetch(`/v1/admin/tenants/${id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tenants_page'] });
      queryClient.invalidateQueries({ queryKey: ['admin_tenants_overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_overview'] });
    },
  });

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateStatusMutation.mutate({ id: tenantId, status: nextStatus });
  };

  const handlePlanChange = (tenantId: string, plan: 'free' | 'pro' | 'enterprise') => {
    updatePlanMutation.mutate({ id: tenantId, plan });
  };

  // Client side filters over loaded page results
  const rawTenants = tenantsData?.data || [];
  const totalItems = tenantsData?.total || 0;
  const totalPages = Math.ceil(totalItems / 10) || 1;

  const filteredTenants = rawTenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || t.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          Tenant Directory
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Assign subscription tiers, audit developer wallets, and suspend or activate partner channels.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '280px', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
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

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Plan Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
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
              <option value="all">All Tiers</option>
              <option value="free">Free Tier</option>
              <option value="pro">Pro Tier</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Tenants Table Ledger */}
      <div className="cyber-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenant ID</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tier</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KYB Status</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  FETCHING RECORD ALLOCATIONS...
                </td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No tenants matching filters found.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => {
                const isStatusActive = t.status === 'active';
                const isKybVerified = t.kyb_status === 'verified';
                const isKybPending = t.kyb_status === 'pending';

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.015)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setActiveDrawerTenant(t)}
                  >
                    <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {t.id.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => handleCopyId(t.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                          title="Copy Full UUID"
                        >
                          {copiedId === t.id ? <Check size={12} style={{ color: 'var(--color-primary)' }} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t.name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{t.email}</td>
                    
                    {/* Subscription Dropdown Column */}
                    <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.plan}
                        onChange={(e) => handlePlanChange(t.id, e.target.value as any)}
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid var(--border-color)',
                          color: t.plan === 'enterprise' ? 'var(--color-secondary)' : t.plan === 'pro' ? 'var(--color-primary)' : '#fff',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <option value="free">FREE</option>
                        <option value="pro">PRO</option>
                        <option value="enterprise">ENTERPRISE</option>
                      </select>
                    </td>

                    {/* Status Toggles Column */}
                    <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStatusChange(t.id, t.status)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isStatusActive ? 'rgba(0, 255, 102, 0.05)' : 'rgba(255, 51, 102, 0.05)',
                          border: isStatusActive ? '1px solid var(--color-primary-border)' : '1px solid rgba(255, 51, 102, 0.2)',
                          color: isStatusActive ? 'var(--color-primary)' : 'var(--color-danger)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = isStatusActive ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 51, 102, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = isStatusActive ? 'rgba(0, 255, 102, 0.05)' : 'rgba(255, 51, 102, 0.05)';
                        }}
                      >
                        {isStatusActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        <span>{t.status.toUpperCase()}</span>
                      </button>
                    </td>

                    {/* KYB Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isKybVerified ? 'var(--color-primary)' : isKybPending ? 'var(--color-warning)' : 'var(--color-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {isKybVerified ? <CheckCircle size={12} /> : isKybPending ? <Clock size={12} /> : <XCircle size={12} />}
                        {t.kyb_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveDrawerTenant(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
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

      {/* Tenant Details Slide-over Drawer */}
      {activeDrawerTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(460px, 100vw)',
          background: 'rgba(8, 10, 15, 0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {/* Drawer Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Tenant Profile</span>
            </h3>
            <button
              onClick={() => setActiveDrawerTenant(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Meta Segment */}
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenant GUID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#fff' }}>
                  {activeDrawerTenant.id}
                </span>
                <button
                  onClick={() => handleCopyId(activeDrawerTenant.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  {copiedId === activeDrawerTenant.id ? <Check size={14} style={{ color: 'var(--color-primary)' }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Representative</span>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {activeDrawerTenant.name}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Contact</span>
                <span style={{ display: 'block', fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                  {activeDrawerTenant.email}
                </span>
              </div>
            </div>

            {/* Subscription and Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Billing Subscription</span>
                <span style={{
                  display: 'inline-flex',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: activeDrawerTenant.plan === 'enterprise' ? 'var(--color-secondary)' : activeDrawerTenant.plan === 'pro' ? 'var(--color-primary)' : '#fff',
                  marginTop: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)'
                }}>
                  {activeDrawerTenant.plan.toUpperCase()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KYB Verification</span>
                <span style={{
                  display: 'inline-flex',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: activeDrawerTenant.kyb_status === 'verified' ? 'var(--color-primary)' : activeDrawerTenant.kyb_status === 'pending' ? 'var(--color-warning)' : 'var(--color-danger)',
                  marginTop: '6px',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {activeDrawerTenant.kyb_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Simulated Workspace Resources */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resource Allocations
              </span>

              {/* Node Wallets */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={16} style={{ color: 'var(--color-secondary)' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block' }}>Monitored Wallets</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered blockchain nodes</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {activeDrawerTenant.plan === 'enterprise' ? '8 Wallets' : activeDrawerTenant.plan === 'pro' ? '3 Wallets' : '1 Wallet'}
                </span>
              </div>

              {/* API Keys */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Terminal size={16} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block' }}>Developer Credentials</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API access keys</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  2 Active Keys
                </span>
              </div>

              {/* Webhooks */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={16} style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block' }}>Webhook Dispatchers</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Event failover channels</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  {activeDrawerTenant.plan === 'free' ? '1 Endpoint' : '2 Endpoints'}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleStatusChange(activeDrawerTenant.id, activeDrawerTenant.status)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                background: activeDrawerTenant.status === 'active' ? 'rgba(255, 51, 102, 0.05)' : 'rgba(0, 255, 102, 0.05)',
                border: activeDrawerTenant.status === 'active' ? '1px solid rgba(255, 51, 102, 0.3)' : '1px solid var(--color-primary-border)',
                color: activeDrawerTenant.status === 'active' ? 'var(--color-danger)' : 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {activeDrawerTenant.status === 'active' ? 'Suspend Tenant Access' : 'Activate Tenant Access'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
