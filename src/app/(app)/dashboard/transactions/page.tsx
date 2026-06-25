'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Layers, RefreshCw, ChevronLeft, ChevronRight, Check, Copy } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface TransactionEvent {
  id: string;
  chain: string;
  token: string;
  tx_hash: string;
  sender_address: string;
  recipient_address: string;
  amount: string;
  block_number: number;
  confirmations: number;
  confirmation_threshold: number;
  status: string;
  environment: string;
  detected_at: string;
  confirmed_at?: string;
  wallet_label?: string;
}

export default function TransactionsPage() {
  const { env } = useDashboard();
  const { success, error: toastError, info } = useToast();
  const [page, setPage] = useState(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [replayTarget, setReplayTarget] = useState<TransactionEvent | null>(null);

  const { data: txData, isLoading: loadingTx, refetch } = useQuery<PaginatedResponse<TransactionEvent>>({
    queryKey: ['transactions', env, page],
    queryFn: () => apiFetch<PaginatedResponse<TransactionEvent>>(`/v1/transactions?page=${page}&limit=10`),
  });

  const replayMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ message: string }>(`/v1/transactions/${id}/replay`, { method: 'POST' }),
    onSuccess: (res) => {
      setReplayTarget(null);
      refetch();
      success(res.message || 'Webhook notification queued successfully.');
    },
    onError: (err: any) => {
      setReplayTarget(null);
      toastError(err.message || 'Failed to dispatch manual replay.');
    },
  });

  const totalPages = txData ? Math.ceil(txData.total / txData.limit) : 0;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':   return 'cyber-badge-success';
      case 'pending':     return 'cyber-badge-warning';
      case 'invalidated': return 'cyber-badge-danger';
      default:            return 'cyber-badge-info';
    }
  };

  return (
    <>
      {/* Manual Replay Confirm */}
      <ConfirmModal
        open={!!replayTarget}
        title="Replay Webhook Notification"
        message={`Manually dispatch a webhook notification for transaction ${replayTarget?.tx_hash?.substring(0, 14)}... to the configured endpoint. This will count against your usage quota.`}
        confirmLabel="Replay"
        variant="info"
        loading={replayMutation.isPending}
        onConfirm={() => replayTarget && replayMutation.mutate(replayTarget.id)}
        onCancel={() => setReplayTarget(null)}
      />

      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} style={{ color: 'var(--color-secondary)' }} />
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scanned Transaction Events
            </h3>
          </div>
        </div>

        <div className="cyber-table-container">
          {loadingTx ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>QUERYING INGESTED LOGS...</div>
          ) : txData?.data && txData.data.length > 0 ? (
            <>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Wallet Label</th>
                    <th>Tx Hash</th>
                    <th>Amount</th>
                    <th>Confs</th>
                    <th>Status</th>
                    <th>Detected</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {txData.data.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.wallet_label || 'Default Node'}</td>
                      <td className="mono-val">
                        <span
                          style={{ cursor: 'pointer', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => copyToClipboard(t.tx_hash, t.id)}
                        >
                          {t.tx_hash.substring(0, 10)}...{t.tx_hash.slice(-6)}
                          {copiedText === t.id
                            ? <Check size={12} style={{ color: 'var(--color-primary)' }} />
                            : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{parseFloat(t.amount).toFixed(4)}</span> {t.token}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {t.confirmations} / {t.confirmation_threshold}
                      </td>
                      <td>
                        <span className={`cyber-badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(t.detected_at).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setReplayTarget(t)}
                          className="cyber-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RefreshCw size={12} /> Replay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
                      className="cyber-btn cyber-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ChevronLeft size={14} /> Back
                    </button>
                    <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                      className="cyber-btn cyber-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No transactions found for the current environment.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
