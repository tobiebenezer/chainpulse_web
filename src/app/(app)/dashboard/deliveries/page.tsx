'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { Activity, RefreshCw, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface DeliveryAttempt {
  id: string;
  tx_event_id: string;
  endpoint_id: string;
  attempt_number: number;
  status: string;
  http_code?: number;
  response_body?: string;
  error_message?: string;
  attempted_at: string;
  next_retry_at?: string;
  is_manual_replay: boolean;
}

export default function DeliveriesPage() {
  const { env } = useDashboard();
  const [page, setPage] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState<DeliveryAttempt | null>(null);

  // Queries
  const { data: deliveriesData, isLoading: loadingDeliveries } = useQuery<PaginatedResponse<DeliveryAttempt>>({
    queryKey: ['deliveries', env, page],
    queryFn: () => apiFetch<PaginatedResponse<DeliveryAttempt>>(`/v1/deliveries?page=${page}&limit=10`),
  });

  const totalPages = deliveriesData ? Math.ceil(deliveriesData.total / deliveriesData.limit) : 0;

  return (
    <div className="cyber-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Webhook Dispatch Logs</h3>
        </div>
      </div>

      {/* Detailed Response Modal */}
      {selectedAttempt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          padding: '16px'
        }}>
          <div className="cyber-card" style={{ maxWidth: '600px', width: '100%', padding: '28px' }}>
            <h3 style={{ marginBottom: '16px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Dispatch Attempt Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="cyber-label">Attempt ID</label>
                  <span className="mono-val" style={{ fontSize: '13px' }}>{selectedAttempt.id}</span>
                </div>
                <div>
                  <label className="cyber-label">Tx Event ID</label>
                  <span className="mono-val" style={{ fontSize: '13px' }}>{selectedAttempt.tx_event_id}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="cyber-label">HTTP Code</label>
                  <span style={{ 
                    color: selectedAttempt.http_code && selectedAttempt.http_code >= 200 && selectedAttempt.http_code < 300 
                      ? 'var(--color-primary)' 
                      : 'var(--color-danger)',
                    fontWeight: 700 
                  }}>
                    {selectedAttempt.http_code ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="cyber-label">Attempt Status</label>
                  <span className={`cyber-badge ${selectedAttempt.status === 'success' ? 'cyber-badge-success' : 'cyber-badge-danger'}`}>
                    {selectedAttempt.status}
                  </span>
                </div>
              </div>

              {selectedAttempt.error_message && (
                <div>
                  <label className="cyber-label" style={{ color: 'var(--color-danger)' }}>Error Trace</label>
                  <pre style={{ 
                    background: 'rgba(255, 51, 102, 0.05)', 
                    border: '1px solid rgba(255, 51, 102, 0.2)', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    color: 'var(--color-danger)',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {selectedAttempt.error_message}
                  </pre>
                </div>
              )}

              <div>
                <label className="cyber-label">Response Body Payload</label>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--border-color)', 
                  padding: '12px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {selectedAttempt.response_body || '[Empty Response]'}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedAttempt(null)} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cyber-table-container">
        {loadingDeliveries ? (
          <div style={{ padding: '24px', color: 'var(--text-muted)' }}>QUERYING DISPATCH TELEMETRY...</div>
        ) : deliveriesData?.data && deliveriesData.data.length > 0 ? (
          <>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Attempt</th>
                  <th>Status</th>
                  <th>HTTP Code</th>
                  <th>Manual Replay</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {deliveriesData.data.map(d => (
                  <tr key={d.id}>
                    <td className="mono-val" style={{ fontSize: '12px' }}>{d.tx_event_id}</td>
                    <td>Attempt #{d.attempt_number}</td>
                    <td>
                      <span className={`cyber-badge ${d.status === 'success' ? 'cyber-badge-success' : 'cyber-badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {d.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {d.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {d.http_code ? (
                        <span style={{ color: d.http_code >= 200 && d.http_code < 300 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                          {d.http_code}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {d.is_manual_replay ? (
                        <span className="cyber-badge cyber-badge-warning" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <RefreshCw size={10} /> Replay
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Automatic</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(d.attempted_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedAttempt(d)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', outline: 'none' }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Showing Page {page} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))} 
                    disabled={page === 1}
                    className="cyber-btn cyber-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                    disabled={page === totalPages}
                    className="cyber-btn cyber-btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            No webhook delivery records found for current workspace.
          </div>
        )}
      </div>
    </div>
  );
}
