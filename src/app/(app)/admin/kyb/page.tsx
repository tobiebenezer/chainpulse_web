'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface KYBProfile {
  id: string;
  tenant_id: string;
  full_name: string;
  business_name: string | null;
  phone_number: string;
  country: string;
  business_category: string;
  website_or_social: string | null;
  intended_use_case: string;
  id_type: string;
  id_number_hash: string;
  status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  reviewer_id: string | null;
}

export default function ComplianceQueue() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Drawer states
  const [selectedProfile, setSelectedProfile] = useState<KYBProfile | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Queries
  const { data: kybData, isLoading } = useQuery<PaginatedResponse<KYBProfile>>({
    queryKey: ['admin_kyb_page', page],
    queryFn: () => apiFetch<PaginatedResponse<KYBProfile>>(`/v1/admin/kyb?page=${page}&limit=10`),
  });

  // Mutations
  const reviewKybMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'verified' | 'rejected'; notes: string }) => {
      return apiFetch(`/v1/admin/kyb/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_kyb_page'] });
      queryClient.invalidateQueries({ queryKey: ['admin_kyb_overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin_tenants_page'] });
      queryClient.invalidateQueries({ queryKey: ['admin_audit_overview'] });
      setSelectedProfile(null);
      setReviewerNotes('');
    },
  });

  const [rejectError, setRejectError] = React.useState('');

  const handleReviewDecision = (status: 'verified' | 'rejected') => {
    if (!selectedProfile) return;
    if (status === 'rejected' && !reviewerNotes.trim()) {
      setRejectError('Reviewer notes are required when rejecting a KYB application.');
      return;
    }
    setRejectError('');
    reviewKybMutation.mutate({
      id: selectedProfile.id,
      status,
      notes: reviewerNotes,
    });
  };

  const handleOpenReviewDrawer = (profile: KYBProfile) => {
    setSelectedProfile(profile);
    setReviewerNotes(profile.reviewer_notes || '');
  };

  // Client side filters
  const rawProfiles = kybData?.data || [];
  const totalItems = kybData?.total || 0;
  const totalPages = Math.ceil(totalItems / 10) || 1;

  const filteredProfiles = rawProfiles.filter(p => {
    const bizName = p.business_name || '';
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tenant_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          Compliance Center
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Evaluate Know Your Business applications, review identity verification details, and manage risk approval flags.
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
              placeholder="Search by business name or representative..."
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

        {/* Status Tab Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'verified', 'rejected'].map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  background: isActive ? 'rgba(0, 255, 102, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 255, 102, 0.2)' : '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance Ledger Table */}
      <div className="cyber-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Name</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Representative</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Country</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Credential</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted At</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  SYNCHRONIZING VERIFICATION QUEUE...
                </td>
              </tr>
            ) : filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No compliance applications found.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((p) => {
                const isVerified = p.status === 'verified';
                const isPending = p.status === 'pending';
                const isRejected = p.status === 'rejected';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.015)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => handleOpenReviewDrawer(p)}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                      {p.business_name || 'Individual Profile'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#f1f5f9' }}>{p.full_name}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.country}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{p.id_type.toUpperCase()}</td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(p.submitted_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isVerified ? 'var(--color-primary)' : isPending ? 'var(--color-warning)' : 'var(--color-danger)'
                      }}>
                        {isVerified ? <CheckCircle size={12} /> : isPending ? <Clock size={12} /> : <XCircle size={12} />}
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenReviewDrawer(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isPending ? 'var(--color-warning)' : 'var(--color-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {isPending ? 'Verify Identity' : 'Inspect Details'}
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

      {/* Verification / Review Slide-over Drawer */}
      {selectedProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(500px, 100vw)',
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
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Verification File</span>
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                TENANT: {selectedProfile.tenant_id}
              </span>
            </div>
            <button
              onClick={() => setSelectedProfile(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Warning if pending */}
            {selectedProfile.status === 'pending' && (
              <div style={{
                background: 'rgba(255, 183, 0, 0.05)',
                border: '1px solid rgba(255, 183, 0, 0.2)',
                borderRadius: '4px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                fontSize: '12px',
                color: 'var(--color-warning)',
                lineHeight: 1.4
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>AWAITING COMPLIANCE CHECK:</strong> Review the representative credentials and intended usage below before issuing system authorization.
                </span>
              </div>
            )}

            {/* Profile Fields List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Business Entity Name</span>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                    {selectedProfile.business_name || 'Individual Operator'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entity Category</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                    {selectedProfile.business_category}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signing Representative</span>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                    {selectedProfile.full_name}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Telephone Contact</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#fff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    {selectedProfile.phone_number}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registration Jurisdiction</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                    {selectedProfile.country}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Website/Social Target</span>
                  <span style={{ display: 'block', fontSize: '14px', color: 'var(--color-secondary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedProfile.website_or_social ? (
                      <a href={selectedProfile.website_or_social.startsWith('http') ? selectedProfile.website_or_social : `https://${selectedProfile.website_or_social}`} target="_blank" rel="noreferrer">
                        {selectedProfile.website_or_social}
                      </a>
                    ) : 'Not Provided'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Intended Integration Use-Case</span>
                <p style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  {selectedProfile.intended_use_case}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} />
                    <span>ID Document Type</span>
                  </span>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                    {selectedProfile.id_type.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Document SHA-256 Hash</span>
                  <span style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedProfile.id_number_hash}>
                    {selectedProfile.id_number_hash}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Decision Inputs */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={12} />
                <span>Auditor Comments / Decision Notes</span>
              </span>
              <textarea
                placeholder="Specify compliance verification review notes. Required for profile rejection..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                disabled={selectedProfile.status !== 'pending' && reviewKybMutation.isPending}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.4
                }}
              />
              {rejectError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{rejectError}</p>
              )}
            </div>
          </div>

          {/* Action Buttons Panel */}
          {selectedProfile.status === 'pending' ? (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleReviewDecision('rejected')}
                disabled={reviewKybMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(255, 51, 102, 0.05)',
                  border: '1px solid rgba(255, 51, 102, 0.3)',
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Reject Request
              </button>
              <button
                onClick={() => handleReviewDecision('verified')}
                disabled={reviewKybMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '4px',
                  background: 'rgba(0, 255, 102, 0.05)',
                  border: '1px solid var(--color-primary-border)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Approve & Verify
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Review complete</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13px', color: '#fff' }}>
                <span style={{ fontWeight: 600 }}>Decision Status:</span>
                <span style={{
                  color: selectedProfile.status === 'verified' ? 'var(--color-primary)' : 'var(--color-danger)',
                  fontWeight: 700
                }}>
                  {selectedProfile.status.toUpperCase()}
                </span>
              </div>
              {selectedProfile.reviewer_notes && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  "{selectedProfile.reviewer_notes}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
