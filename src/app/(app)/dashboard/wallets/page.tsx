'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '../dashboard-context';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Cpu, Plus, Trash2, Check, Copy } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Wallet {
  id: string;
  chain: string;
  address: string;
  label: string;
  active: boolean;
  confirmation_threshold: number;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '16px',
      }}
    >
      {children}
    </div>
  );
}

export default function WalletsPage() {
  const { env } = useDashboard();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [newWalletThreshold, setNewWalletThreshold] = useState(1);
  const [walletError, setWalletError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Confirm delete state
  const [deleteTarget, setDeleteTarget] = useState<Wallet | null>(null);

  const { data: walletsData, isLoading: loadingWallets } = useQuery<PaginatedResponse<Wallet>>({
    queryKey: ['wallets', env],
    queryFn: () => apiFetch<PaginatedResponse<Wallet>>('/v1/wallets?limit=100'),
  });

  const createWalletMutation = useMutation({
    mutationFn: () => {
      setWalletError('');
      return apiFetch('/v1/wallets', {
        method: 'POST',
        body: JSON.stringify({
          chain: 'bsc',
          address: newWalletAddress,
          label: newWalletLabel,
          confirmation_threshold: newWalletThreshold,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setNewWalletAddress('');
      setNewWalletLabel('');
      setNewWalletThreshold(1);
      setShowWalletModal(false);
      success('Wallet address registered and being monitored.');
    },
    onError: (err: any) => {
      setWalletError(err.message || 'Failed to register wallet');
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/v1/wallets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setDeleteTarget(null);
      success('Wallet address removed from monitoring.');
    },
    onError: (err: any) => {
      setDeleteTarget(null);
      toastError(err.message || 'Failed to delete wallet');
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      {/* Add Wallet Modal */}
      {showWalletModal && (
        <Modal>
          <div className="cyber-card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <h3 style={{ marginBottom: '16px', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
              Track BSC Address
            </h3>
            {walletError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>
                {walletError}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="cyber-label">Hex Wallet Address</label>
                <input type="text" className="cyber-input" placeholder="0x..."
                  value={newWalletAddress} onChange={(e) => setNewWalletAddress(e.target.value)} />
              </div>
              <div>
                <label className="cyber-label">Custom Label</label>
                <input type="text" className="cyber-input" placeholder="e.g. Deposit Node #12"
                  value={newWalletLabel} onChange={(e) => setNewWalletLabel(e.target.value)} />
              </div>
              <div>
                <label className="cyber-label">Confirmations Threshold</label>
                <input type="number" className="cyber-input" min={1}
                  value={newWalletThreshold}
                  onChange={(e) => setNewWalletThreshold(parseInt(e.target.value) || 1)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowWalletModal(false)}
                className="cyber-btn cyber-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => createWalletMutation.mutate()}
                disabled={createWalletMutation.isPending}
                className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {createWalletMutation.isPending ? 'Syncing...' : 'Register'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Stop Monitoring Wallet"
        message={`Are you sure you want to stop tracking "${deleteTarget?.label || deleteTarget?.address}"? No further events will be detected for this address.`}
        confirmLabel="Remove"
        variant="danger"
        loading={deleteWalletMutation.isPending}
        onConfirm={() => deleteTarget && deleteWalletMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} style={{ color: 'var(--color-secondary)' }} />
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Node Monitored Wallets
            </h3>
          </div>
          <button onClick={() => { setWalletError(''); setShowWalletModal(true); }}
            className="cyber-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Plus size={14} /> Add Deposit Address
          </button>
        </div>

        <div className="cyber-table-container">
          {loadingWallets ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>QUERYING ACTIVE ADDRESSES...</div>
          ) : walletsData?.data && walletsData.data.length > 0 ? (
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Wallet Label</th>
                  <th>Network</th>
                  <th>Address</th>
                  <th>Min Confs</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {walletsData.data.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.label || 'Unnamed Wallet'}</td>
                    <td><span className="cyber-badge cyber-badge-info">{w.chain}</span></td>
                    <td className="mono-val">
                      <span
                        style={{ cursor: 'pointer', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => copyToClipboard(w.address, w.id)}
                      >
                        {w.address.substring(0, 8)}...{w.address.slice(-6)}
                        {copiedText === w.id
                          ? <Check size={12} style={{ color: 'var(--color-primary)' }} />
                          : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
                      </span>
                    </td>
                    <td>{w.confirmation_threshold} Blocks</td>
                    <td>
                      <span className="cyber-badge cyber-badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--color-primary)', borderRadius: '50%' }} />
                        Active
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setDeleteTarget(w)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', outline: 'none' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No blockchain addresses configured yet. Hook up a wallet to trace events.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
